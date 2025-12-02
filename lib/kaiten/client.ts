/**
 * Kaiten API Client
 * Клиент для работы с Kaiten API с поддержкой пагинации и фильтрации
 */

import type {
  KaitenCard,
  KaitenBoard,
  KaitenSpace,
  KaitenUser,
  KaitenColumn,
  KaitenLane,
  KaitenCardType,
  KaitenTag,
  KaitenPropertyDefinition,
  PaginationParams,
  KaitenTimeLog,
  KaitenRole,
  KaitenTreeEntityRole,
  KaitenSpaceUser,
} from "./types";

// Исправление двойных слэшей в URL и удаление /api/latest если есть
const RAW_URL = process.env.KAITEN_API_URL || "";
const KAITEN_URL = RAW_URL
  .replace(/\/$/, "")  // Убираем trailing slash
  .replace(/\/api\/latest\/?$/, "")  // Убираем /api/latest если добавили
  .replace(/\/api\/v1\/?$/, "");  // Убираем /api/v1 если добавили

const KAITEN_TOKEN = process.env.KAITEN_API_TOKEN || "";
const DEFAULT_PAGE_SIZE = 100;

// Валидация обязательных переменных окружения
if (!KAITEN_URL || !KAITEN_TOKEN) {
  console.error(
    "❌ Missing Kaiten API credentials:\n" +
    "   Set KAITEN_API_URL=https://your-company.kaiten.ru\n" +
    "   Set KAITEN_API_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  );
}

/**
 * Базовая функция для запросов к Kaiten API
 */
async function fetchKaiten<T>(
  endpoint: string,
  params?: Record<string, string | number>
): Promise<T> {
  const url = new URL(`${KAITEN_URL}/api/latest/${endpoint}`);

  // Добавляем query parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  // Детальное логирование для отладки
  console.log("🔍 Kaiten API Request:", {
    url: url.toString(),
    endpoint,
    hasToken: !!KAITEN_TOKEN,
    // Не логируем полный токен для безопасности
    tokenPrefix: KAITEN_TOKEN?.substring(0, 4) + "...",
  });

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${KAITEN_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Kaiten API Error:", {
      status: response.status,
      url: url.toString(),
      errorBody: errorText,
    });
    throw new Error(
      `Kaiten API Error ${response.status}: ${response.statusText}. ${errorText}`
    );
  }

  console.log("✅ Kaiten API Success:", endpoint);
  return response.json();
}

/**
 * Универсальная функция для получения всех записей с пагинацией
 */
async function fetchAllPaginated<T>(
  endpoint: string,
  options: PaginationParams & Record<string, any> = {}
): Promise<T[]> {
  const {
    limit = DEFAULT_PAGE_SIZE,
    offset: initialOffset = 0,
    updated_since,
    ...restParams // Захватываем from/to
  } = options;

  const allItems: T[] = [];
  let currentOffset = initialOffset;
  let hasMore = true;
  let pageCount = 0;

  console.log(`📄 Starting paginated fetch for ${endpoint} (limit: ${limit})`);

  while (hasMore) {
    pageCount++;
    const params: Record<string, string | number> = {
      limit,
      offset: currentOffset,
      ...restParams,
    };

    if (updated_since) {
      params.updated_since = updated_since;
    }

    try {
      const response = await fetchKaiten<{ items?: T[]; data?: T[]; time_logs?: T[] }>(
        endpoint,
        params
      );

      // Умный парсинг: берем items, data, time_logs или сам ответ
      const rawItems = 
        (response as any).items || 
        (response as any).data || 
        (response as any).time_logs || 
        response;
        
      const items = Array.isArray(rawItems) ? rawItems : [];

      console.log(`  📄 Page ${pageCount}: offset=${currentOffset}, received=${items.length} items`);

      if (items.length === 0) {
        console.log(`  ✅ No more items, stopping pagination`);
        hasMore = false;
      } else {
        allItems.push(...items);
        currentOffset += items.length;

        if (items.length < limit) {
          console.log(`  ✅ Received ${items.length} < ${limit}, last page reached`);
          hasMore = false;
        } else {
          console.log(`  ➡️ Full page received, fetching next...`);
        }
      }
    } catch (error) {
      console.error(`❌ Error fetching ${endpoint} at offset ${currentOffset}:`, error);
      throw error;
    }

    if (hasMore) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log(`✅ Completed ${endpoint}: ${allItems.length} total items`);
  return allItems;
}

/**
 * Kaiten API Client
 */
export const kaitenClient = {
  async getSpaces(params?: PaginationParams): Promise<KaitenSpace[]> {
    return fetchAllPaginated<KaitenSpace>("spaces", params);
  },

  async getSpace(id: number): Promise<KaitenSpace> {
    return fetchKaiten<KaitenSpace>(`spaces/${id}`);
  },

  // Доски (через перебор спейсов)
  async getBoards(): Promise<KaitenBoard[]> {
    console.log("Fetching spaces for boards...");
    const spaces = await this.getSpaces();
    const allBoards: KaitenBoard[] = [];
    const chunkSize = 5;
    
    for (let i = 0; i < spaces.length; i += chunkSize) {
        const chunk = spaces.slice(i, i + chunkSize);
        const results = await Promise.allSettled(chunk.map(s => fetchKaiten<KaitenBoard[]>(`spaces/${s.id}/boards`)));
        results.forEach(r => {
            if (r.status === 'fulfilled') allBoards.push(...r.value);
        });
    }
    return allBoards;
  },

  async getBoard(id: number): Promise<KaitenBoard> {
    return fetchKaiten<KaitenBoard>(`boards/${id}`);
  },

  async getBoardsBySpace(spaceId: number): Promise<KaitenBoard[]> {
    return fetchKaiten<KaitenBoard[]>(`spaces/${spaceId}/boards`);
  },

  async getColumns(): Promise<KaitenColumn[]> {
    const boards = await this.getBoards();
    const allColumns: KaitenColumn[] = [];
    const chunkSize = 5;
    for (let i = 0; i < boards.length; i += chunkSize) {
        const chunk = boards.slice(i, i + chunkSize);
        const results = await Promise.allSettled(chunk.map(b => fetchKaiten<KaitenColumn[]>(`boards/${b.id}/columns`)));
        results.forEach(r => {
            if (r.status === 'fulfilled') allColumns.push(...r.value);
        });
    }
    return allColumns;
  },

  async getColumnsByBoard(boardId: number): Promise<KaitenColumn[]> {
    return fetchKaiten<KaitenColumn[]>(`boards/${boardId}/columns`);
  },

  async getLanes(): Promise<KaitenLane[]> {
    const boards = await this.getBoards();
    const allLanes: KaitenLane[] = [];
    const chunkSize = 5;
    for (let i = 0; i < boards.length; i += chunkSize) {
        const chunk = boards.slice(i, i + chunkSize);
        const results = await Promise.allSettled(chunk.map(b => fetchKaiten<KaitenLane[]>(`boards/${b.id}/lanes`)));
        results.forEach(r => {
            if (r.status === 'fulfilled') allLanes.push(...r.value);
        });
    }
    return allLanes;
  },

  async getLanesByBoard(boardId: number): Promise<KaitenLane[]> {
    return fetchKaiten<KaitenLane[]>(`boards/${boardId}/lanes`);
  },

  async getUsers(params?: PaginationParams): Promise<KaitenUser[]> {
    return fetchAllPaginated<KaitenUser>("company/users", params);
  },

  async getUser(id: number): Promise<KaitenUser> {
    return fetchKaiten<KaitenUser>(`users/${id}`);
  },

  async getCardTypes(): Promise<KaitenCardType[]> {
    return fetchKaiten<KaitenCardType[]>("card-types");
  },

  async getTags(): Promise<KaitenTag[]> {
    return fetchKaiten<KaitenTag[]>("tags");
  },

  async getPropertyDefinitions(): Promise<KaitenPropertyDefinition[]> {
    return fetchKaiten<KaitenPropertyDefinition[]>("company/custom-properties");
  },

  async getCards(params?: PaginationParams): Promise<KaitenCard[]> {
    return fetchAllPaginated<KaitenCard>("cards", params);
  },

  async getCard(id: number): Promise<KaitenCard> {
    return fetchKaiten<KaitenCard>(`cards/${id}`);
  },

  async getCardsByBoard(boardId: number, params?: PaginationParams): Promise<KaitenCard[]> {
    return fetchAllPaginated<KaitenCard>(`boards/${boardId}/cards`, params);
  },

  async getTimeLogs(params?: PaginationParams & { from?: string; to?: string }): Promise<KaitenTimeLog[]> {
    return fetchAllPaginated<KaitenTimeLog>("time-logs", params as any);
  },

  async getCardsByStatus(
    status: "done" | "active" | "archived",
    params?: PaginationParams
  ): Promise<KaitenCard[]> {
    const filterMap = {
      done: { completed_at: "not_null" },
      active: { archived: false, completed_at: "null" },
      archived: { archived: true },
    };

    return fetchAllPaginated<KaitenCard>("cards", {
      ...params,
      ...filterMap[status],
    } as any);
  },

  // Роли для тайм-логов (user-roles)
  async getRoles(): Promise<KaitenRole[]> {
    return fetchKaiten<KaitenRole[]>("user-roles");
  },

  // ============================================
  // 🔥 НОВЫЕ МЕТОДЫ: Tree Entity Roles & Space Members
  // ============================================

  /**
   * Получить каталог ролей доступа (tree-entity-roles)
   * Это роли типа admin, writer, reader, "Художник" и т.д.
   */
  async getTreeEntityRoles(): Promise<KaitenTreeEntityRole[]> {
    return fetchKaiten<KaitenTreeEntityRole[]>("tree-entity-roles");
  },

  /**
   * Получить участников конкретного space с их ролями
   * @param includeInactive - включить неактивных пользователей
   */
  async getSpaceUsers(spaceId: number, includeInactive = false): Promise<KaitenSpaceUser[]> {
    const params: Record<string, string> = {};
    if (includeInactive) {
      params.inactive = 'true';
    }
    return fetchKaiten<KaitenSpaceUser[]>(`spaces/${spaceId}/users`, params);
  },

  /**
   * Получить всех участников всех spaces (включая неактивных)
   * Возвращает массив объектов { spaceId, users }
   */
  async getAllSpaceMembers(): Promise<Array<{ spaceId: number; users: KaitenSpaceUser[] }>> {
    console.log("📥 Fetching all space members (active + inactive)...");
    const spaces = await this.getSpaces();
    console.log(`📥 Found ${spaces.length} spaces to fetch members from`);
    
    const allSpaceMembers: Array<{ spaceId: number; users: KaitenSpaceUser[] }> = [];
    const chunkSize = 2; // Уменьшаем чанк т.к. теперь 2 запроса на space

    for (let i = 0; i < spaces.length; i += chunkSize) {
      const chunk = spaces.slice(i, i + chunkSize);
      console.log(`📥 Fetching users for spaces: ${chunk.map(s => s.id).join(', ')}`);
      
      const results = await Promise.allSettled(
        chunk.map(async (space) => {
          // Запрос 1: активные пользователи (с inherited access)
          const activeUsers = await fetchKaiten<KaitenSpaceUser[]>(
            `spaces/${space.id}/users`, 
            { include_inherited_access: 'true' }
          );
          
          // Запрос 2: неактивные пользователи (с inherited access)
          const inactiveUsers = await fetchKaiten<KaitenSpaceUser[]>(
            `spaces/${space.id}/users`, 
            { include_inherited_access: 'true', inactive: 'true' }
          );
          
          // Объединяем (используем Map чтобы избежать дубликатов по user_id)
          const usersMap = new Map<number, KaitenSpaceUser>();
          activeUsers.forEach(u => usersMap.set(u.id, u));
          inactiveUsers.forEach(u => usersMap.set(u.id, u));
          
          const allUsers = Array.from(usersMap.values());
          
          console.log(`   Space ${space.id} (${space.title}): ${activeUsers.length} active + ${inactiveUsers.length} inactive = ${allUsers.length} total`);
          
          // Диагностика неактивных пользователей
          if (inactiveUsers.length > 0) {
            console.log(`   📋 Inactive users in space ${space.id}:`);
            inactiveUsers.forEach(u => {
              console.log(`      - ${u.id} (${u.full_name}): role_ids=${JSON.stringify(u.role_ids)}, own_role_ids=${JSON.stringify(u.own_role_ids)}`);
            });
          }
          
          return { spaceId: space.id, users: allUsers };
        })
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          allSpaceMembers.push(result.value);
        } else {
          console.warn(`⚠️ Failed to fetch space users:`, result.reason);
        }
      });

      // Пауза между чанками для rate limiting
      if (i + chunkSize < spaces.length) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    const totalUsers = allSpaceMembers.reduce((sum, s) => sum + s.users.length, 0);
    console.log(`✅ Fetched members from ${allSpaceMembers.length} spaces (${totalUsers} total user-space pairs)`);
    
    return allSpaceMembers;
  },
};

export const kaitenUtils = {
  async calculatePayloadHash(payload: any): Promise<string> {
    const jsonString = JSON.stringify(payload, Object.keys(payload).sort());
    const msgBuffer = new TextEncoder().encode(jsonString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  },

  needsUpdate(existingHash: string | null, newHash: string): boolean {
    return existingHash !== newHash;
  },
};
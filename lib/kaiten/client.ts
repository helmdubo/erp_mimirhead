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
} from "./types";

const KAITEN_URL = process.env.KAITEN_API_URL || "";
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

// Проверяем что пользователь не добавил /api/latest в URL (частая ошибка)
if (KAITEN_URL && (KAITEN_URL.includes('/api/latest') || KAITEN_URL.includes('/api/v1'))) {
  console.error(
    "❌ KAITEN_API_URL should NOT include /api/latest or /api/v1\n" +
    "   Use only: https://your-company.kaiten.ru"
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
    tokenLength: KAITEN_TOKEN?.length,
    tokenPrefix: KAITEN_TOKEN?.substring(0, 8) + "...",
    baseUrl: KAITEN_URL,
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
      statusText: response.statusText,
      url: url.toString(),
      errorBody: errorText,
      headers: Object.fromEntries(response.headers.entries()),
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
  options: PaginationParams = {}
): Promise<T[]> {
  const {
    limit = DEFAULT_PAGE_SIZE,
    offset: initialOffset = 0,
    updated_since,
  } = options;

  const allItems: T[] = [];
  let currentOffset = initialOffset;
  let hasMore = true;

  while (hasMore) {
    const params: Record<string, string | number> = {
      limit,
      offset: currentOffset,
    };

    if (updated_since) {
      params.updated_since = updated_since;
    }

    try {
      const response = await fetchKaiten<{ items?: T[]; data?: T[] }>(
        endpoint,
        params
      );

      // Kaiten может возвращать либо { items: [] }, либо прямой массив
      const items = response.items || response.data || (Array.isArray(response) ? response : []);

      if (items.length === 0) {
        hasMore = false;
      } else {
        allItems.push(...items);
        currentOffset += items.length;

        // Если получили меньше чем limit, значит это последняя страница
        if (items.length < limit) {
          hasMore = false;
        }
      }
    } catch (error) {
      console.error(`Error fetching ${endpoint} at offset ${currentOffset}:`, error);
      throw error;
    }

    // Небольшая пауза между запросами чтобы не перегружать API
    if (hasMore) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return allItems;
}

/**
 * Kaiten API Client
 */
export const kaitenClient = {
  /**
   * Пространства (Spaces)
   */
  async getSpaces(params?: PaginationParams): Promise<KaitenSpace[]> {
    return fetchAllPaginated<KaitenSpace>("spaces", params);
  },

  async getSpace(id: number): Promise<KaitenSpace> {
    return fetchKaiten<KaitenSpace>(`spaces/${id}`);
  },

  /**
   * Доски (Boards)
   * ВАЖНО: Kaiten не имеет глобального эндпоинта /api/latest/boards.
   * Доски получаются через перебор всех пространств.
   */
  async getBoards(_params?: PaginationParams): Promise<KaitenBoard[]> {
    console.log("📋 Fetching all spaces to discover boards...");
    const spaces = await this.getSpaces();
    console.log(`✅ Found ${spaces.length} spaces. Fetching boards for each...`);

    const allBoards: KaitenBoard[] = [];

    // Используем for..of для последовательной загрузки (защита от rate limit)
    for (const space of spaces) {
      try {
        const spaceBoards = await this.getBoardsBySpace(space.id);
        console.log(`  ↳ Space "${space.title}" (${space.id}): ${spaceBoards.length} boards`);
        allBoards.push(...spaceBoards);
      } catch (error) {
        console.error(`❌ Failed to fetch boards for space ${space.id} ("${space.title}")`, error);
        // Не падаем, если один спейс недоступен - продолжаем с остальными
      }
    }

    console.log(`✅ Total boards fetched: ${allBoards.length}`);
    return allBoards;
  },

  async getBoard(id: number): Promise<KaitenBoard> {
    return fetchKaiten<KaitenBoard>(`boards/${id}`);
  },

  async getBoardsBySpace(spaceId: number): Promise<KaitenBoard[]> {
    return fetchKaiten<KaitenBoard[]>(`spaces/${spaceId}/boards`);
  },

  /**
   * Колонки (Columns)
   * ВАЖНО: Если Kaiten не имеет глобального /columns, получаем через доски.
   */
  async getColumns(_params?: PaginationParams): Promise<KaitenColumn[]> {
    console.log("📊 Fetching all boards to discover columns...");
    const boards = await this.getBoards();
    console.log(`✅ Found ${boards.length} boards. Fetching columns for each...`);

    const allColumns: KaitenColumn[] = [];

    for (const board of boards) {
      try {
        const boardColumns = await this.getColumnsByBoard(board.id);
        console.log(`  ↳ Board "${board.title}" (${board.id}): ${boardColumns.length} columns`);
        allColumns.push(...boardColumns);
      } catch (error) {
        console.error(`❌ Failed to fetch columns for board ${board.id} ("${board.title}")`, error);
      }
    }

    console.log(`✅ Total columns fetched: ${allColumns.length}`);
    return allColumns;
  },

  async getColumnsByBoard(boardId: number): Promise<KaitenColumn[]> {
    return fetchKaiten<KaitenColumn[]>(`boards/${boardId}/columns`);
  },

  /**
   * Дорожки (Lanes)
   * ВАЖНО: Если Kaiten не имеет глобального /lanes, получаем через доски.
   */
  async getLanes(_params?: PaginationParams): Promise<KaitenLane[]> {
    console.log("🛤️ Fetching all boards to discover lanes...");
    const boards = await this.getBoards();
    console.log(`✅ Found ${boards.length} boards. Fetching lanes for each...`);

    const allLanes: KaitenLane[] = [];

    for (const board of boards) {
      try {
        const boardLanes = await this.getLanesByBoard(board.id);
        console.log(`  ↳ Board "${board.title}" (${board.id}): ${boardLanes.length} lanes`);
        allLanes.push(...boardLanes);
      } catch (error) {
        console.error(`❌ Failed to fetch lanes for board ${board.id} ("${board.title}")`, error);
      }
    }

    console.log(`✅ Total lanes fetched: ${allLanes.length}`);
    return allLanes;
  },

  async getLanesByBoard(boardId: number): Promise<KaitenLane[]> {
    return fetchKaiten<KaitenLane[]>(`boards/${boardId}/lanes`);
  },

  /**
   * Пользователи (Users)
   */
  async getUsers(params?: PaginationParams): Promise<KaitenUser[]> {
    return fetchAllPaginated<KaitenUser>("users", params);
  },

  async getUser(id: number): Promise<KaitenUser> {
    return fetchKaiten<KaitenUser>(`users/${id}`);
  },

  /**
   * Типы карточек (Card Types)
   */
  async getCardTypes(): Promise<KaitenCardType[]> {
    return fetchKaiten<KaitenCardType[]>("card-types");
  },

  /**
   * Теги (Tags)
   */
  async getTags(): Promise<KaitenTag[]> {
    return fetchKaiten<KaitenTag[]>("tags");
  },

  /**
   * Определения свойств (Property Definitions)
   */
  async getPropertyDefinitions(): Promise<KaitenPropertyDefinition[]> {
    return fetchKaiten<KaitenPropertyDefinition[]>("company/custom-properties");
  },

  /**
   * Карточки (Cards)
   */
  async getCards(params?: PaginationParams): Promise<KaitenCard[]> {
    return fetchAllPaginated<KaitenCard>("cards", params);
  },

  async getCard(id: number): Promise<KaitenCard> {
    return fetchKaiten<KaitenCard>(`cards/${id}`);
  },

  async getCardsByBoard(boardId: number, params?: PaginationParams): Promise<KaitenCard[]> {
    return fetchAllPaginated<KaitenCard>(`boards/${boardId}/cards`, params);
  },

  /**
   * Получить карточки с фильтром по статусу
   */
  async getCardsByStatus(
    status: "done" | "active" | "archived",
    params?: PaginationParams
  ): Promise<KaitenCard[]> {
    const filterMap = {
      done: { completed_at: "not_null" },
      active: { archived: false, completed_at: "null" },
      archived: { archived: true },
    };

    // Kaiten API может иметь свои фильтры, это пример
    // Нужно уточнить документацию API
    return fetchAllPaginated<KaitenCard>("cards", {
      ...params,
      ...filterMap[status],
    } as any);
  },
};

/**
 * Утилиты для работы с Kaiten данными
 */
export const kaitenUtils = {
  /**
   * Вычисляет MD5 хэш для payload (для определения изменений)
   */
  async calculatePayloadHash(payload: any): Promise<string> {
    const jsonString = JSON.stringify(payload, Object.keys(payload).sort());
    const msgBuffer = new TextEncoder().encode(jsonString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  },

  /**
   * Определяет нужно ли обновлять запись (сравнивая хэши)
   */
  needsUpdate(existingHash: string | null, newHash: string): boolean {
    return existingHash !== newHash;
  },
};

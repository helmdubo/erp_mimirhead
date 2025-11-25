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
 * Retry helper с экспоненциальной задержкой
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Проверяем, является ли это сетевой ошибкой
      const isNetworkError =
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNREFUSED' ||
        error.message?.includes('fetch failed') ||
        error.message?.includes('network');

      // Не ретраим, если это не сетевая ошибка или это последняя попытка
      if (!isNetworkError || attempt === maxRetries) {
        throw error;
      }

      // Экспоненциальная задержка: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`⚠️ Network error (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Базовая функция для запросов к Kaiten API с retry логикой
 */
async function fetchKaiten<T>(
  endpoint: string,
  params?: Record<string, string | number>
): Promise<T> {
  return retryWithBackoff(async () => {
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
  });
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
    ...rest
  } = options as any;

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
    };

    if (updated_since) {
      params.updated_since = updated_since;
    }
    // Пропускаем остальные параметры (например, from, to)
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined) {
        params[key] = value as any;
      }
    });

    try {
      const response = await fetchKaiten<{ items?: T[]; data?: T[] }>(
        endpoint,
        params
      );

      // Kaiten может возвращать либо { items: [] }, либо прямой массив
      const rawItems = (response as any).items || (response as any).data || response;
      const items = Array.isArray(rawItems) ? rawItems : [];

      console.log(`  📄 Page ${pageCount}: offset=${currentOffset}, received=${items.length} items`);

      if (items.length === 0) {
        console.log(`  ✅ No more items, stopping pagination`);
        hasMore = false;
      } else {
        allItems.push(...items);
        currentOffset += items.length;
        // Если получили меньше чем limit, значит это последняя страница
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

    // Небольшая пауза между запросами чтобы не перегружать API
    if (hasMore) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log(`✅ Completed ${endpoint}: ${allItems.length} total items in ${pageCount} pages`);
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
  async getBoards(): Promise<KaitenBoard[]> {
    console.log("📋 Fetching all spaces to discover boards...");
    const spaces = await this.getSpaces();
    console.log(`✅ Found ${spaces.length} spaces. Fetching boards for each...`);

    const allBoards: KaitenBoard[] = [];

    // Параллелизация с ограничением - по 5 пространств одновременно
    const chunkSize = 5;
    for (let i = 0; i < spaces.length; i += chunkSize) {
      const chunk = spaces.slice(i, i + chunkSize);
      const results = await Promise.allSettled(
        chunk.map(async (space) => {
          const spaceBoards = await this.getBoardsBySpace(space.id);
          console.log(`  ↳ Space "${space.title}" (${space.id}): ${spaceBoards.length} boards`);
          return spaceBoards;
        })
      );

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          allBoards.push(...result.value);
        } else {
          console.error(`❌ Failed to fetch boards for space ${chunk[idx].id}`, result.reason);
        }
      });
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
   * ВАЖНО: Kaiten не имеет глобального /columns, получаем через доски.
   */
  async getColumns(): Promise<KaitenColumn[]> {
    console.log("📊 Fetching all boards to discover columns...");
    const boards = await this.getBoards();
    console.log(`✅ Found ${boards.length} boards. Fetching columns for each...`);

    const allColumns: KaitenColumn[] = [];

    // Параллелизация с ограничением - по 5 досок одновременно
    const chunkSize = 5;
    for (let i = 0; i < boards.length; i += chunkSize) {
      const chunk = boards.slice(i, i + chunkSize);
      const results = await Promise.allSettled(
        chunk.map(async (board) => {
          const boardColumns = await this.getColumnsByBoard(board.id);
          console.log(`  ↳ Board "${board.title}" (${board.id}): ${boardColumns.length} columns`);
          return boardColumns;
        })
      );

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          allColumns.push(...result.value);
        } else {
          console.error(`❌ Failed to fetch columns for board ${chunk[idx].id}`, result.reason);
        }
      });
    }

    console.log(`✅ Total columns fetched: ${allColumns.length}`);
    return allColumns;
  },

  async getColumnsByBoard(boardId: number): Promise<KaitenColumn[]> {
    return fetchKaiten<KaitenColumn[]>(`boards/${boardId}/columns`);
  },

  /**
   * Дорожки (Lanes)
   * ВАЖНО: Kaiten не имеет глобального /lanes, получаем через доски.
   */
  async getLanes(): Promise<KaitenLane[]> {
    console.log("🛤️ Fetching all boards to discover lanes...");
    const boards = await this.getBoards();
    console.log(`✅ Found ${boards.length} boards. Fetching lanes for each...`);

    const allLanes: KaitenLane[] = [];

    // Параллелизация с ограничением - по 5 досок одновременно
    const chunkSize = 5;
    for (let i = 0; i < boards.length; i += chunkSize) {
      const chunk = boards.slice(i, i + chunkSize);
      const results = await Promise.allSettled(
        chunk.map(async (board) => {
          const boardLanes = await this.getLanesByBoard(board.id);
          console.log(`  ↳ Board "${board.title}" (${board.id}): ${boardLanes.length} lanes`);
          return boardLanes;
        })
      );

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          allLanes.push(...result.value);
        } else {
          console.error(`❌ Failed to fetch lanes for board ${chunk[idx].id}`, result.reason);
        }
      });
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
    return fetchAllPaginated<KaitenUser>("company/users", params);
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
    return fetchAllPaginated<KaitenCard>("cards", {
      ...params,
      ...filterMap[status],
    } as any);
  },

  /**
   * Логи времени (Time Logs)
   * Можно указать диапазон дат через параметры from/to (YYYY-MM-DD),
   * либо использовать updated_since для инкрементальной синхронизации.
   */
  async getTimeLogs(params?: PaginationParams): Promise<KaitenTimeLog[]> {
    return fetchAllPaginated<KaitenTimeLog>("time-logs", params as any);
  },
};

/**
 * Утилиты для работы с Kaiten данными
 */
export const kaitenUtils = {
  /**
   * Вычисляет SHA-256 хэш для payload (для определения изменений)
   * Сортирует ключи перед сериализацией для стабильности результата.
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
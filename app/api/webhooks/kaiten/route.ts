/**
 * Kaiten Webhook Handler
 * Обрабатывает события из Kaiten в реальном времени
 */

import { NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { kaitenUtils } from "@/lib/kaiten";

/**
 * Обработчик POST запросов от Kaiten
 */
export async function POST(request: Request) {
  try {
    // 1. Валидация вебхука (опционально, но рекомендуется)
    // TODO: Реализовать проверку HMAC signature
    // if (WEBHOOK_SECRET) {
    //   const signature = request.headers.get("x-kaiten-signature");
    //   if (!validateSignature(signature, body, WEBHOOK_SECRET)) {
    //     return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    //   }
    // }

    // 2. Парсим тело запроса
    const body = await request.json();
    const event = body.event; // Например: "card.create", "card.update", "card.move"
    const data = body.data; // Сама сущность

    if (!event || !data) {
      return NextResponse.json(
        { error: "Invalid payload: missing event or data" },
        { status: 400 }
      );
    }

    console.log(`📥 Webhook received: ${event}`, { id: data.id });

    // 3. Получаем клиент Supabase
    const supabase = getServiceSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 500 }
      );
    }

    // 4. Обрабатываем событие
    const result = await handleWebhookEvent(event, data, supabase);

    // 5. Логируем webhook в sync_logs
    await logWebhook(supabase, event, data.id, result.success, result.error);

    return NextResponse.json({ success: result.success, message: result.message });
  } catch (error: any) {
    console.error("❌ Webhook handler error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Обработка события вебхука
 */
async function handleWebhookEvent(event: string, data: any, supabase: any) {
  const entityType = event.split(".")[0]; // "card", "board", etc.
  const action = event.split(".")[1]; // "create", "update", "delete", etc.

  try {
    switch (entityType) {
      case "card":
        return await handleCardEvent(action, data, supabase);

      case "board":
        return await handleBoardEvent(action, data, supabase);

      case "space":
        return await handleSpaceEvent(action, data, supabase);

      case "user":
        return await handleUserEvent(action, data, supabase);

      default:
        console.warn(`Unknown entity type: ${entityType}`);
        return { success: true, message: `Ignored unknown entity: ${entityType}` };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Обработка событий карточек
 */
async function handleCardEvent(action: string, data: any, supabase: any) {
  const schema = supabase.schema("kaiten");

  switch (action) {
    case "create":
    case "update":
    case "move":
      // Для всех этих событий делаем upsert
      const cardData = {
        id: data.id,
        uid: data.uid || null,
        title: data.title,
        description: data.description || null,
        space_id: data.space_id || null,
        board_id: data.board_id,
        column_id: data.column_id,
        lane_id: data.lane_id || null,
        type_id: data.type_id || null,
        owner_id: data.owner_id || data.members?.[0]?.id || null,
        creator_id: data.creator_id || null,
        state: data.state || null,
        archived: data.archived || false,
        blocked: data.blocked || false,
        size_text: data.size_text || null,
        due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
        time_spent_sum: data.time_spent_sum || 0,
        time_blocked_sum: data.time_blocked_sum || 0,
        started_at: data.started_at ? new Date(data.started_at).toISOString() : null,
        completed_at: data.completed_at ? new Date(data.completed_at).toISOString() : null,
        properties: data.properties || {},
        tags_cache: data.tags || [],
        kaiten_updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
        payload_hash: await kaitenUtils.calculatePayloadHash(data),
        raw_payload: data,
      };

      const { error: upsertError } = await schema
        .from("cards")
        .upsert(cardData, { onConflict: "id" });

      if (upsertError) throw upsertError;

      // Синхронизируем M:N связи с тегами
      await syncCardTags(supabase, data);

      return { success: true, message: `Card ${data.id} ${action}d` };

    case "archive":
    case "delete":
      // Помечаем как архивную
      const { error: archiveError } = await schema
        .from("cards")
        .update({
          archived: true,
          synced_at: new Date().toISOString(),
        })
        .eq("id", data.id);

      if (archiveError) throw archiveError;

      return { success: true, message: `Card ${data.id} archived` };

    default:
      return { success: true, message: `Unknown card action: ${action}` };
  }
}

/**
 * Обработка событий досок
 */
async function handleBoardEvent(action: string, data: any, supabase: any) {
  const schema = supabase.schema("kaiten");

  if (action === "create" || action === "update") {
    const boardData = {
      id: data.id,
      uid: data.uid || null,
      space_id: data.space_id,
      title: data.title,
      description: data.description || null,
      board_type: data.board_type || null,
      archived: data.archived || false,
      sort_order: data.sort_order || null,
      kaiten_updated_at: new Date().toISOString(),
      synced_at: new Date().toISOString(),
      payload_hash: await kaitenUtils.calculatePayloadHash(data),
      raw_payload: data,
    };

    const { error } = await schema
      .from("boards")
      .upsert(boardData, { onConflict: "id" });

    if (error) throw error;

    return { success: true, message: `Board ${data.id} ${action}d` };
  }

  return { success: true, message: `Handled board.${action}` };
}

/**
 * Обработка событий пространств
 */
async function handleSpaceEvent(action: string, data: any, supabase: any) {
  const schema = supabase.schema("kaiten");

  if (action === "create" || action === "update") {
    const spaceData = {
      id: data.id,
      uid: data.uid || null,
      title: data.title,
      company_id: data.company_id || null,
      owner_user_id: data.owner_user_id || null,
      archived: data.archived || false,
      sort_order: data.sort_order || null,
      kaiten_updated_at: new Date().toISOString(),
      synced_at: new Date().toISOString(),
      payload_hash: await kaitenUtils.calculatePayloadHash(data),
      raw_payload: data,
    };

    const { error } = await schema
      .from("spaces")
      .upsert(spaceData, { onConflict: "id" });

    if (error) throw error;

    return { success: true, message: `Space ${data.id} ${action}d` };
  }

  return { success: true, message: `Handled space.${action}` };
}

/**
 * Обработка событий пользователей
 */
async function handleUserEvent(action: string, data: any, supabase: any) {
  const schema = supabase.schema("kaiten");

  if (action === "create" || action === "update") {
    const userData = {
      id: data.id,
      uid: data.uid || null,
      full_name: data.full_name || null,
      email: data.email || null,
      username: data.username || null,
      timezone: data.timezone || null,
      role: data.role || null,
      is_admin: data.is_admin || false,
      last_request_date: data.last_request_date
        ? new Date(data.last_request_date).toISOString()
        : null,
      kaiten_updated_at: new Date().toISOString(),
      synced_at: new Date().toISOString(),
      payload_hash: await kaitenUtils.calculatePayloadHash(data),
      raw_payload: data,
    };

    const { error } = await schema
      .from("users")
      .upsert(userData, { onConflict: "id" });

    if (error) throw error;

    return { success: true, message: `User ${data.id} ${action}d` };
  }

  return { success: true, message: `Handled user.${action}` };
}

/**
 * Логирование вебхука в sync_logs
 */
async function logWebhook(
  supabase: any,
  event: string,
  entityId: number,
  success: boolean,
  errorMessage?: string
) {
  try {
    await supabase.from("sync_logs").insert({
      entity_type: event.split(".")[0],
      sync_type: "webhook",
      status: success ? "completed" : "failed",
      records_processed: 1,
      records_updated: success ? 1 : 0,
      error_message: errorMessage || null,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: 0,
      metadata: { event, entity_id: entityId },
    });
  } catch (error) {
    console.error("Failed to log webhook:", error);
  }
}

/**
 * Синхронизация M:N связей карточки с тегами
 */
async function syncCardTags(supabase: any, cardData: any) {
  const schema = supabase.schema("kaiten");

  try {
    // Удаляем существующие связи
    await schema.from("card_tags").delete().eq("card_id", cardData.id);

    // Если есть теги, создаем новые связи
    if (cardData.tags && Array.isArray(cardData.tags) && cardData.tags.length > 0) {
      const tagLinks = cardData.tags.map((tag: any) => ({
        card_id: cardData.id,
        tag_id: tag.id,
      }));

      await schema.from("card_tags").insert(tagLinks);
    }
  } catch (error) {
    console.error(`Failed to sync card_tags for card ${cardData.id}:`, error);
    // Не бросаем ошибку, чтобы не блокировать основную синхронизацию
  }
}

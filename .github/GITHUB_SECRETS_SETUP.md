# Настройка GitHub Secrets для автоматических миграций

## Зачем это нужно?

GitHub Actions будет автоматически применять миграции к Supabase при каждом push с изменениями в папке `supabase/migrations/`. Но для этого нужно дать GitHub доступ к вашему проекту Supabase.

---

## Шаг 1: Получите необходимые данные из Supabase

### 1.1 SUPABASE_PROJECT_ID

1. Откройте [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Откройте **Settings** (иконка шестеренки) → **General**
4. Найдите **Reference ID** (это короткий ID, например: `biiffkjbkmzuvxuvbvoe`)
5. Скопируйте его

### 1.2 SUPABASE_DB_PASSWORD

Это пароль базы данных, который вы указали при создании проекта Supabase.

**Если забыли пароль:**
1. В Supabase откройте **Settings** → **Database**
2. Нажмите **Reset Database Password**
3. Сохраните новый пароль в надежном месте!

### 1.3 SUPABASE_ACCESS_TOKEN

1. Откройте [https://supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Нажмите **Generate new token**
3. Дайте имя токену (например: `github-actions-migrations`)
4. Скопируйте токен (он больше не покажется!)

---

## Шаг 2: Добавьте секреты в GitHub

1. Откройте ваш репозиторий на GitHub: [https://github.com/helmdubo/erp_mimirhead](https://github.com/helmdubo/erp_mimirhead)

2. Перейдите в **Settings** (вкладка справа вверху)

3. В левом меню найдите **Secrets and variables** → **Actions**

4. Нажмите **New repository secret** три раза и добавьте:

   **Секрет 1:**
   - Name: `SUPABASE_PROJECT_ID`
   - Secret: (ваш Reference ID из шага 1.1)

   **Секрет 2:**
   - Name: `SUPABASE_DB_PASSWORD`
   - Secret: (ваш пароль БД из шага 1.2)

   **Секрет 3:**
   - Name: `SUPABASE_ACCESS_TOKEN`
   - Secret: (ваш токен из шага 1.3)

---

## Шаг 3: Проверьте работу

После добавления секретов:

1. Создайте любую миграцию или измените существующую в папке `supabase/migrations/`
2. Сделайте commit и push
3. Откройте вкладку **Actions** в вашем GitHub репозитории
4. Вы увидите запущенный workflow "Apply Supabase Migrations"
5. Если всё правильно - workflow завершится успешно ✅

---

## Что делает этот workflow?

1. **Автоматически применяет миграции** при каждом push с изменениями в `supabase/migrations/`
2. **Обновляет типы TypeScript** в `types/database.types.ts`
3. **Коммитит обновленные типы** обратно в репозиторий
4. Можно **запустить вручную** через вкладку Actions → "Apply Supabase Migrations" → Run workflow

---

## Безопасность

- ✅ Секреты надежно зашифрованы GitHub
- ✅ Они не показываются в логах
- ✅ Только вы и GitHub Actions имеют к ним доступ
- ⚠️ Никогда не коммитьте секреты в код!

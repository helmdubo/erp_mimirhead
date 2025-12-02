import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          ERP Mimirhead
        </h1>
        <p className="mb-8 text-slate-600">
          Система управления проектами и ресурсами студии
        </p>

        {/* Навигация */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Синхронизация */}
          <Link
            href="/admin/sync"
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <div className="mb-3 text-3xl">🔄</div>
            <h2 className="mb-1 text-lg font-semibold text-slate-900 group-hover:text-blue-600">
              Синхронизация
            </h2>
            <p className="text-sm text-slate-500">
              Загрузка данных из Kaiten: карточки, таймшиты, пользователи
            </p>
          </Link>

          {/* Сотрудники и роли */}
          <Link
            href="/admin/employees"
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-purple-300 hover:shadow-md"
          >
            <div className="mb-3 text-3xl">👥</div>
            <h2 className="mb-1 text-lg font-semibold text-slate-900 group-hover:text-purple-600">
              Сотрудники
            </h2>
            <p className="text-sm text-slate-500">
              Роли доступа, участники spaces, распределение по проектам
            </p>
          </Link>

          {/* Таймшиты (placeholder) */}
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 opacity-60">
            <div className="mb-3 text-3xl">⏱️</div>
            <h2 className="mb-1 text-lg font-semibold text-slate-400">
              Таймшиты
            </h2>
            <p className="text-sm text-slate-400">
              Анализ трудозатрат (скоро)
            </p>
          </div>

          {/* Финансы (placeholder) */}
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 opacity-60">
            <div className="mb-3 text-3xl">💰</div>
            <h2 className="mb-1 text-lg font-semibold text-slate-400">
              Финансы
            </h2>
            <p className="text-sm text-slate-400">
              Биллинг и инвойсы (скоро)
            </p>
          </div>

          {/* Проекты (placeholder) */}
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 opacity-60">
            <div className="mb-3 text-3xl">📁</div>
            <h2 className="mb-1 text-lg font-semibold text-slate-400">
              Проекты
            </h2>
            <p className="text-sm text-slate-400">
              Управление проектами (скоро)
            </p>
          </div>

          {/* Отчёты (placeholder) */}
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 opacity-60">
            <div className="mb-3 text-3xl">📊</div>
            <h2 className="mb-1 text-lg font-semibold text-slate-400">
              Отчёты
            </h2>
            <p className="text-sm text-slate-400">
              Аналитика и дашборды (скоро)
            </p>
          </div>
        </div>

        {/* Быстрые ссылки */}
        <div className="mt-8 rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Быстрые действия
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/sync"
              className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-200"
            >
              🔄 Синхронизация Kaiten
            </Link>
            <Link
              href="/admin/employees"
              className="rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-200"
            >
              👥 Роли и участники
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

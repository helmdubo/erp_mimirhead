import Link from "next/link";
import { 
  getSpaceMembersDetailed, 
  getUserRolesSummary, 
  getTreeEntityRoles,
  getSpacesForFilter 
} from "@/app/actions/employees-actions";
import { EmployeesTable } from "./employees-table";

export default async function EmployeesPage() {
  // Загружаем данные параллельно
  const [membersResult, summaryResult, rolesResult, spacesResult] = await Promise.all([
    getSpaceMembersDetailed(),
    getUserRolesSummary(),
    getTreeEntityRoles(),
    getSpacesForFilter(),
  ]);

  const hasData = membersResult.data.length > 0 || summaryResult.data.length > 0;

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link 
              href="/" 
              className="mb-2 inline-block text-sm text-slate-500 hover:text-slate-700"
            >
              ← На главную
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">
              👥 Сотрудники и роли
            </h1>
            <p className="text-slate-600">
              Участники spaces, распределение ролей доступа
            </p>
          </div>
          <Link
            href="/admin/sync"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            🔄 Синхронизация
          </Link>
        </div>

        {/* Errors */}
        {(membersResult.error || summaryResult.error || rolesResult.error) && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
            <p className="font-medium">Ошибка загрузки данных:</p>
            <ul className="mt-1 list-inside list-disc text-sm">
              {membersResult.error && <li>Участники: {membersResult.error}</li>}
              {summaryResult.error && <li>Сводка: {summaryResult.error}</li>}
              {rolesResult.error && <li>Роли: {rolesResult.error}</li>}
            </ul>
          </div>
        )}

        {/* No data warning */}
        {!hasData && !membersResult.error && (
          <div className="mb-6 rounded-lg bg-amber-50 p-6 text-center">
            <p className="text-lg font-medium text-amber-800">
              Данные о ролях и участниках ещё не загружены
            </p>
            <p className="mt-2 text-amber-700">
              Перейдите в{" "}
              <Link href="/admin/sync" className="underline hover:no-underline">
                Синхронизацию
              </Link>{" "}
              и нажмите кнопку «👥 Роли доступа и участники»
            </p>
          </div>
        )}

        {/* Stats cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-slate-900">
              {summaryResult.data.length}
            </p>
            <p className="text-sm text-slate-500">Пользователей</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-slate-900">
              {spacesResult.data.length}
            </p>
            <p className="text-sm text-slate-500">Spaces</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-slate-900">
              {rolesResult.data.length}
            </p>
            <p className="text-sm text-slate-500">Ролей</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-slate-900">
              {membersResult.data.length}
            </p>
            <p className="text-sm text-slate-500">Назначений ролей</p>
          </div>
        </div>

        {/* Roles catalog */}
        {rolesResult.data.length > 0 && (
          <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-semibold text-slate-700">Каталог ролей</h2>
            <div className="flex flex-wrap gap-2">
              {rolesResult.data.map((role) => (
                <span
                  key={role.id}
                  className={`rounded-full px-3 py-1 text-sm ${
                    role.company_uid
                      ? "bg-purple-100 text-purple-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {role.name}
                  {role.company_uid && (
                    <span className="ml-1 text-xs opacity-60">(custom)</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interactive table */}
        {hasData && (
          <EmployeesTable
            members={membersResult.data}
            summary={summaryResult.data}
            roles={rolesResult.data}
            spaces={spacesResult.data}
          />
        )}
      </div>
    </main>
  );
}

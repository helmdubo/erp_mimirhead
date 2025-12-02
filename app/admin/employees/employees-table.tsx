"use client";

import { useState, useMemo } from "react";
import type { 
  SpaceMemberDetail, 
  UserRoleSummary, 
  TreeEntityRole 
} from "@/app/actions/employees-actions";

interface EmployeesTableProps {
  members: SpaceMemberDetail[];
  summary: UserRoleSummary[];
  roles: TreeEntityRole[];
  spaces: { id: number; title: string }[];
}

type ViewMode = "detailed" | "summary";

export function EmployeesTable({ members, summary, roles, spaces }: EmployeesTableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  
  // Фильтры
  const [selectedSpaces, setSelectedSpaces] = useState<Set<number>>(new Set());
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [showCustomRolesOnly, setShowCustomRolesOnly] = useState(false);
  const [showGroupRolesOnly, setShowGroupRolesOnly] = useState(false);
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Колонки для отображения
  const [visibleColumns, setVisibleColumns] = useState({
    user: true,
    email: true,
    space: true,
    role: true,
    isGroup: true,
    isCustom: true,
  });

  // Фильтрация детальных данных
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (selectedSpaces.size > 0 && !selectedSpaces.has(m.space_id)) return false;
      if (selectedRoles.size > 0 && m.role_id && !selectedRoles.has(m.role_id)) return false;
      if (showCustomRolesOnly && !m.is_custom_role) return false;
      if (showGroupRolesOnly && !m.is_from_group) return false;
      if (showInactiveOnly && !m.is_inactive) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !m.user_name?.toLowerCase().includes(q) &&
          !m.user_email?.toLowerCase().includes(q) &&
          !m.role_name?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [members, selectedSpaces, selectedRoles, showCustomRolesOnly, showGroupRolesOnly, showInactiveOnly, searchQuery]);

  // Фильтрация сводки
  const filteredSummary = useMemo(() => {
    return summary.filter((s) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !s.full_name?.toLowerCase().includes(q) &&
          !s.email?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (selectedSpaces.size > 0) {
        // Проверяем есть ли у юзера хоть один выбранный space
        const userSpaceIds = members
          .filter((m) => m.user_id === s.user_id)
          .map((m) => m.space_id);
        if (!userSpaceIds.some((id) => selectedSpaces.has(id))) return false;
      }
      return true;
    });
  }, [summary, members, selectedSpaces, searchQuery]);

  const toggleSpace = (id: number) => {
    const newSet = new Set(selectedSpaces);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedSpaces(newSet);
  };

  const toggleRole = (id: string) => {
    const newSet = new Set(selectedRoles);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRoles(newSet);
  };

  const clearFilters = () => {
    setSelectedSpaces(new Set());
    setSelectedRoles(new Set());
    setShowCustomRolesOnly(false);
    setShowGroupRolesOnly(false);
    setShowInactiveOnly(false);
    setSearchQuery("");
  };

  const hasActiveFilters = 
    selectedSpaces.size > 0 || 
    selectedRoles.size > 0 || 
    showCustomRolesOnly || 
    showGroupRolesOnly || 
    showInactiveOnly ||
    searchQuery;

  return (
    <div className="space-y-4">
      {/* View mode toggle */}
      <div className="flex items-center gap-4">
        <div className="flex rounded-lg bg-slate-200 p-1">
          <button
            onClick={() => setViewMode("summary")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              viewMode === "summary"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📊 Сводка по пользователям
          </button>
          <button
            onClick={() => setViewMode("detailed")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              viewMode === "detailed"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📋 Детальный список
          </button>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-800"
          >
            ✕ Сбросить фильтры
          </button>
        )}
      </div>

      {/* Filters panel */}
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-700">Фильтры</h3>
          <span className="text-sm text-slate-500">
            Показано: {viewMode === "summary" ? filteredSummary.length : filteredMembers.length} записей
          </span>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Поиск по имени, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Spaces filter */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-600">Spaces (проекты)</p>
            <div className="flex flex-wrap gap-2">
              {spaces.map((space) => (
                <label
                  key={space.id}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-sm transition ${
                    selectedSpaces.has(space.id)
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSpaces.has(space.id)}
                    onChange={() => toggleSpace(space.id)}
                    className="sr-only"
                  />
                  {space.title}
                </label>
              ))}
            </div>
          </div>

          {/* Roles filter */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-600">Роли</p>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <label
                  key={role.id}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-sm transition ${
                    selectedRoles.has(role.id)
                      ? "bg-purple-600 text-white"
                      : role.company_uid
                      ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.has(role.id)}
                    onChange={() => toggleRole(role.id)}
                    className="sr-only"
                  />
                  {role.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Additional filters */}
        {viewMode === "detailed" && (
          <div className="mt-4 flex flex-wrap gap-4 border-t pt-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showCustomRolesOnly}
                onChange={(e) => setShowCustomRolesOnly(e.target.checked)}
                className="rounded border-slate-300"
              />
              Только кастомные роли
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showGroupRolesOnly}
                onChange={(e) => setShowGroupRolesOnly(e.target.checked)}
                className="rounded border-slate-300"
              />
              Только роли через группы
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showInactiveOnly}
                onChange={(e) => setShowInactiveOnly(e.target.checked)}
                className="rounded border-slate-300"
              />
              👻 Только неактивные
            </label>
          </div>
        )}

        {/* Column visibility (detailed view) */}
        {viewMode === "detailed" && (
          <div className="mt-4 border-t pt-4">
            <p className="mb-2 text-sm font-medium text-slate-600">Видимые колонки</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries({
                user: "Пользователь",
                email: "Email",
                space: "Space",
                role: "Роль",
                isGroup: "Через группу",
                isCustom: "Кастомная",
              }).map(([key, label]) => (
                <label key={key} className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={visibleColumns[key as keyof typeof visibleColumns]}
                    onChange={(e) =>
                      setVisibleColumns((v) => ({ ...v, [key]: e.target.checked }))
                    }
                    className="rounded border-slate-300"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="overflow-x-auto">
          {viewMode === "summary" ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Пользователь</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 text-center">Spaces</th>
                  <th className="px-4 py-3">Роли</th>
                  <th className="px-4 py-3">Проекты</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSummary.map((user) => (
                  <tr key={user.user_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {user.full_name}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{user.email}</td>
                    <td className="px-4 py-3 text-center">{user.spaces_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.role_names?.filter(Boolean).map((role, i) => (
                          <span
                            key={i}
                            className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.space_titles?.filter(Boolean).map((space, i) => (
                          <span
                            key={i}
                            className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
                          >
                            {space}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSummary.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Нет данных для отображения
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  {visibleColumns.user && <th className="px-4 py-3">Пользователь</th>}
                  {visibleColumns.email && <th className="px-4 py-3">Email</th>}
                  {visibleColumns.space && <th className="px-4 py-3">Space</th>}
                  {visibleColumns.role && <th className="px-4 py-3">Роль</th>}
                  {visibleColumns.isGroup && <th className="px-4 py-3 text-center">Группа</th>}
                  {visibleColumns.isCustom && <th className="px-4 py-3 text-center">Custom</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m, idx) => (
                  <tr key={idx} className={`hover:bg-slate-50 ${m.is_inactive ? "opacity-60" : ""}`}>
                    {visibleColumns.user && (
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {m.is_inactive && <span title="Деактивирован">👻 </span>}
                        {m.user_name}
                      </td>
                    )}
                    {visibleColumns.email && (
                      <td className="px-4 py-3 text-slate-500">{m.user_email}</td>
                    )}
                    {visibleColumns.space && (
                      <td className="px-4 py-3">
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                          {m.space_title}
                        </span>
                      </td>
                    )}
                    {visibleColumns.role && (
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${
                            m.is_inactive
                              ? "bg-slate-200 text-slate-500 italic"
                              : m.is_custom_role
                              ? "bg-purple-100 text-purple-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {m.is_inactive ? "👻 Неактивен" : m.role_name}
                        </span>
                      </td>
                    )}
                    {visibleColumns.isGroup && (
                      <td className="px-4 py-3 text-center">
                        {m.is_from_group ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-slate-300">–</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.isCustom && (
                      <td className="px-4 py-3 text-center">
                        {m.is_custom_role ? (
                          <span className="text-purple-600">✓</span>
                        ) : (
                          <span className="text-slate-300">–</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td
                      colSpan={Object.values(visibleColumns).filter(Boolean).length}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Нет данных для отображения
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

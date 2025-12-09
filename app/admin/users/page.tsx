"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";

type UserRole = "USER" | "ADMIN";

interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isBlocked?: boolean;
  createdAt?: string;
  averageRating?: number;
  verified?: boolean;
}

export default function ManageUsersPage() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "BLOCKED">("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Simple guard – only ADMIN can see this page
  if (user && user.role !== "ADMIN") {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <h1 className="text-2xl font-semibold text-red-500 mb-2">
          Unauthorized
        </h1>
        <p className="text-slate-300">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  // ✅ Make this defensive about "list" not being an array
  const applyFilters = (
    list: AdminUser[] | undefined | null,
    searchTerm: string,
    roleF: typeof roleFilter,
    statusF: typeof statusFilter
  ) => {
    const safeList = Array.isArray(list) ? list : [];
    let result = [...safeList];

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower)
      );
    }

    if (roleF !== "ALL") {
      result = result.filter((u) => u.role === roleF);
    }

    if (statusF !== "ALL") {
      if (statusF === "ACTIVE") {
        result = result.filter((u) => !u.isBlocked);
      } else {
        result = result.filter((u) => !!u.isBlocked);
      }
    }

    return result;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);

      try {
        // Adjust endpoint if your backend uses e.g. /admin/users
        const res = await api.get("/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // ✅ Normalize response shape safely
        const raw = res.data?.data ?? res.data;

        let data: AdminUser[] = [];
        if (Array.isArray(raw)) {
          data = raw;
        } else if (Array.isArray(raw?.users)) {
          // if your backend wraps it like { users: [...] }
          data = raw.users;
        } else if (Array.isArray(raw?.results)) {
          // or like { results: [...] }
          data = raw.results;
        } else {
          data = [];
        }

        setUsers(data);
        setFilteredUsers(applyFilters(data, search, roleFilter, statusFilter));
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    setFilteredUsers(applyFilters(users, search, roleFilter, statusFilter));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter, statusFilter, users]);

  const handleChangeRole = async (id: string, newRole: UserRole) => {
    if (!token) return;
    setActionLoadingId(id);
    setError(null);

    try {
      await api.patch(
        `/users/${id}`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to update user role");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleBlock = async (id: string, currentBlocked?: boolean) => {
    if (!token) return;
    const confirmText = currentBlocked
      ? "Unblock this user?"
      : "Block this user? They will not be able to login.";
    if (!window.confirm(confirmText)) return;

    setActionLoadingId(id);
    setError(null);

    try {
      await api.patch(
        `/users/${id}`,
        { isBlocked: !currentBlocked },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, isBlocked: !currentBlocked } : u
        )
      );
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to change user status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to permanently delete this user?")) {
      return;
    }

    setActionLoadingId(id);
    setError(null);

    try {
      await api.delete(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Manage Users</h1>
          <p className="text-slate-400 text-sm">
            View, search and manage all users on the Travel Buddy platform.
          </p>
        </div>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
          Total: {users.length}
        </span>
      </div>

      <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">Users</option>
            <option value="ADMIN">Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-900 bg-red-950/60 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-slate-400">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-10 text-center text-slate-400">
          No users found with current filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/70 text-slate-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={u._id}
                  className="border-t border-slate-800/80 hover:bg-slate-900/40"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
<Link href={`/profile?user=${encodeURIComponent(u._id)}`} className="font-medium ...">
  {u.fullName}
</Link>
                      <span className="text-xs text-slate-400">{u.email}</span>
                      {u.verified && (
                        <span className="mt-1 inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      disabled={actionLoadingId === u._id}
                      value={u.role}
                      onChange={(e) =>
                        handleChangeRole(u._id, e.target.value as UserRole)
                      }
                      className="rounded-lg border border-slate-700 bg-slate-900/70 px-2 py-1 text-xs text-slate-100"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {u.averageRating ? (
                      <span className="text-xs text-yellow-300">
                        ⭐ {u.averageRating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">No reviews</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.isBlocked ? (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-300">
                        Blocked
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                        disabled={actionLoadingId === u._id}
                        className={`rounded-lg border px-2 py-1 text-xs font-medium transition ${
                          u.isBlocked
                            ? "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                            : "border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                        } ${
                          actionLoadingId === u._id ? "opacity-60" : ""
                        }`}
                      >
                        {u.isBlocked ? "Unblock" : "Block"}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={actionLoadingId === u._id}
                        className="rounded-lg border border-red-500/40 px-2 py-1 text-xs font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

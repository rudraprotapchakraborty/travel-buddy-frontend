"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";
import {
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  User,
  Ban,
  Mail,
  Calendar,
  Star,
  Loader2
} from "lucide-react";

// --- Types ---

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

// --- Components ---

const StatCard = ({ label, value, icon: Icon, colorClass }: any) => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
    <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10 ${colorClass}`} />
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`rounded-xl p-3 bg-opacity-20 ${colorClass.replace("bg-", "bg-").replace("text-", "text-")} bg-white/5`}>
        <Icon className={`h-6 w-6 ${colorClass.replace("bg-", "text-")}`} />
      </div>
    </div>
  </div>
);

const UserAvatar = ({ name }: { name: string }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
    
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-white ring-2 ring-slate-800">
      {initials}
    </div>
  );
};

// --- Main Page ---

export default function ManageUsersPage() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "BLOCKED">("ALL");
  
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // --- Logic ---

  // Defensive filtering logic
  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower)
      );
    }

    if (roleFilter !== "ALL") {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== "ALL") {
      if (statusFilter === "ACTIVE") result = result.filter((u) => !u.isBlocked);
      if (statusFilter === "BLOCKED") result = result.filter((u) => !!u.isBlocked);
    }

    return result;
  }, [users, search, roleFilter, statusFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => !u.isBlocked).length,
      blocked: users.filter(u => u.isBlocked).length,
      admins: users.filter(u => u.role === "ADMIN").length
    };
  }, [users]);

  // Fetch Data
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/users", { headers: { Authorization: `Bearer ${token}` } });
        const raw = res.data?.data ?? res.data;
        
        let data: AdminUser[] = [];
        if (Array.isArray(raw)) data = raw;
        else if (Array.isArray(raw?.users)) data = raw.users;
        else if (Array.isArray(raw?.results)) data = raw.results;
        
        setUsers(data);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  // Actions
  const handleChangeRole = async (id: string, newRole: UserRole) => {
    if (!token) return;
    setActionLoadingId(id);
    try {
      await api.patch(`/users/${id}`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleBlock = async (id: string, currentBlocked?: boolean) => {
    if (!token) return;
    const confirmMsg = currentBlocked ? "Unblock this user?" : "Block this user? They will simply lose access.";
    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(id);
    try {
      await api.patch(`/users/${id}`, { isBlocked: !currentBlocked }, { headers: { Authorization: `Bearer ${token}` } });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isBlocked: !currentBlocked } : u)));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!token) return;
    if (!window.confirm("PERMANENTLY DELETE USER? This cannot be undone.")) return;

    setActionLoadingId(id);
    try {
      await api.delete(`/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Guard
  if (user && user.role !== "ADMIN") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <ShieldAlert className="h-16 w-16 text-rose-500 mb-4" />
        <h1 className="text-3xl font-bold text-white">Access Denied</h1>
        <p className="text-slate-400 mt-2">You do not have permission to view this resource.</p>
        <Link href="/" className="mt-6 px-4 py-2 bg-slate-800 rounded-lg text-white hover:bg-slate-700">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">User Management</h1>
          <p className="text-slate-400">Manage access, roles, and user accounts.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Users" value={stats.total} icon={User} colorClass="bg-blue-500 text-blue-500" />
          <StatCard label="Active Users" value={stats.active} icon={CheckCircle2} colorClass="bg-emerald-500 text-emerald-500" />
          <StatCard label="Blocked Users" value={stats.blocked} icon={Ban} colorClass="bg-rose-500 text-rose-500" />
          <StatCard label="Admins" value={stats.admins} icon={Shield} colorClass="bg-purple-500 text-purple-500" />
        </div>

        {/* Controls & Filters */}
        <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-3">
             <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="h-10 appearance-none rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-8 text-sm text-slate-300 focus:border-primary-500 focus:outline-none"
                >
                  <option value="ALL">All Roles</option>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
             </div>

             <div className="relative">
                <div className="absolute left-3 top-1/2 h-2 w-2 rounded-full bg-slate-500 -translate-y-1/2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="h-10 appearance-none rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-8 text-sm text-slate-300 focus:border-primary-500 focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 shadow-inner backdrop-blur">
          {error && (
            <div className="m-4 flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200">
              <ShieldAlert className="h-4 w-4" />
              {error}
            </div>
          )}

          {loading ? (
             <div className="flex h-64 flex-col items-center justify-center text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-2" />
                <p>Loading user directory...</p>
             </div>
          ) : filteredUsers.length === 0 ? (
             <div className="flex h-64 flex-col items-center justify-center text-slate-500">
                <Search className="h-12 w-12 text-slate-700 mb-4" />
                <p className="text-lg font-medium text-slate-300">No users found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User Profile</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Joined</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="group hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={u.fullName} />
                          <div className="flex flex-col">
                            <Link href={`/profile?user=${u._id}`} className="font-medium text-slate-200 hover:text-primary-400 hover:underline">
                              {u.fullName}
                            </Link>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                               <Mail className="h-3 w-3" />
                               {u.email}
                               {u.verified && (
                                 <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/10 text-blue-400" title="Verified">
                                   <CheckCircle2 className="h-2.5 w-2.5" />
                                 </span>
                               )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <select
                            disabled={actionLoadingId === u._id}
                            value={u.role}
                            onChange={(e) => handleChangeRole(u._id, e.target.value as UserRole)}
                            className={`rounded-full border border-slate-700 bg-transparent px-2.5 py-1 text-xs font-medium focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 
                                ${u.role === "ADMIN" ? "text-purple-400 bg-purple-500/5 border-purple-500/20" : "text-slate-400"}`}
                          >
                            <option value="USER" className="bg-slate-900 text-slate-300">User</option>
                            <option value="ADMIN" className="bg-slate-900 text-slate-300">Admin</option>
                          </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <span className={`relative flex h-2.5 w-2.5`}>
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${u.isBlocked ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${u.isBlocked ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                           </span>
                           <span className={`text-xs font-medium ${u.isBlocked ? "text-rose-400" : "text-emerald-400"}`}>
                              {u.isBlocked ? "Blocked" : "Active"}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 tabular-nums">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                           <button
                             onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                             disabled={actionLoadingId === u._id}
                             title={u.isBlocked ? "Unblock User" : "Block User"}
                             className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                           >
                              {actionLoadingId === u._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : u.isBlocked ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Ban className="h-4 w-4 text-amber-400" />
                              )}
                           </button>
                           
                           <button
                             onClick={() => handleDeleteUser(u._id)}
                             disabled={actionLoadingId === u._id}
                             title="Delete User"
                             className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                           >
                              <Trash2 className="h-4 w-4" />
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
        
        {/* Footer Note */}
        <div className="text-center text-xs text-slate-600">
           Showing {filteredUsers.length} results
        </div>
      </div>
    </div>
  );
}
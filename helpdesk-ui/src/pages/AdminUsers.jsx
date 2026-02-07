import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "../styles/adminUsers.css";

const ROLE_OPTIONS = ["EndUser", "ITAdmin", "HRAdmin"]; // no Master assignment

export default function AdminUsers() {
    const profile = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("profile") || "null");
        } catch {
            return null;
        }
    }, []);

    const isMaster = profile?.role === "Master";

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // track pending role changes: { [userId]: "ITAdmin" }
    const [pendingRole, setPendingRole] = useState({});
    const [savingId, setSavingId] = useState(null);

    const load = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await api.get("/api/users");
            setUsers(res.data || []);
            setPendingRole({});
        } catch (e) {
            console.error("Users load error:", e?.response?.status, e?.response?.data || e.message);
            setError("Failed to load users (Master only).");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isMaster) load();
        else setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMaster]);

    const changeRole = (userId, newRole) => {
        setPendingRole((prev) => ({ ...prev, [userId]: newRole }));
    };

    const saveRole = async (user) => {
        const newRole = pendingRole[user.id];
        if (!newRole || newRole === user.role) return;

        setSavingId(user.id);
        setError("");

        try {
            await api.put(`/api/users/${user.id}/role`, { role: newRole });
            await load();
        } catch (e) {
            console.error("Save role error:", e?.response?.status, e?.response?.data || e.message);
            const msg =
                (typeof e?.response?.data === "string" && e.response.data) ||
                "Failed to update role.";
            setError(msg);
        } finally {
            setSavingId(null);
        }
    };

    if (!isMaster) {
        return (
            <div className="admin-wrap">
                <h1>Admin Panel</h1>
                <p className="muted">Access denied. This page is for Master account only.</p>
            </div>
        );
    }

    if (loading) return <p>Loading users...</p>;

    return (
        <div className="admin-wrap">
            <div className="admin-top">
                <div>
                    <h1>Users & Roles</h1>
                    <p className="muted">Master-only: manage user roles (IT/HR admin).</p>
                </div>
                <button className="refresh-btn" onClick={load} disabled={savingId !== null}>
                    Refresh
                </button>
            </div>

            {error && <div className="error-box">{error}</div>}

            <div className="table-wrap">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Current Role</th>
                            <th>Change Role</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => {
                            const selected = pendingRole[u.id] ?? u.role;
                            const hasChange = selected !== u.role;
                            const isSaving = savingId === u.id;

                            return (
                                <tr key={u.id}>
                                    <td className="name">{u.fullName}</td>
                                    <td className="email">{u.email}</td>
                                    <td>
                                        <span className={`role-pill role-${String(u.role).toLowerCase()}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            value={selected}
                                            onChange={(e) => changeRole(u.id, e.target.value)}
                                            disabled={isSaving}
                                        >
                                            {/* keep current role if it’s Master (but don’t allow assigning Master) */}
                                            {u.role === "Master" && <option value="Master">Master</option>}

                                            {ROLE_OPTIONS.map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="actions">
                                        <button
                                            className="save-btn"
                                            onClick={() => saveRole(u)}
                                            disabled={!hasChange || isSaving}
                                            title={!hasChange ? "No changes" : "Save role"}
                                        >
                                            {isSaving ? "Saving..." : "Save"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="empty">
                        <p>No users found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

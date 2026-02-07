import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "../styles/adminLookups.css";

export default function AdminDepartments() {
    const profile = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("profile") || "null");
        } catch {
            return null;
        }
    }, []);

    const isMaster = profile?.role === "Master";

    const [items, setItems] = useState([]);
    const [newName, setNewName] = useState("");
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");

    // inline edit state
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/api/admin/departments");
            setItems(res.data || []);
        } catch (e) {
            console.error("Departments load error:", e?.response?.status, e?.response?.data || e.message);
            setError("Failed to load departments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isMaster) load();
        else setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMaster]);

    const startEdit = (item) => {
        setEditId(item.id);
        setEditName(item.name);
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditName("");
    };

    const create = async (e) => {
        e.preventDefault();
        const name = newName.trim();
        if (!name) return;

        setBusyId("create");
        setError("");
        try {
            await api.post("/api/admin/departments", { name });
            setNewName("");
            await load();
        } catch (e) {
            console.error("Create department error:", e?.response?.status, e?.response?.data || e.message);
            setError(typeof e?.response?.data === "string" ? e.response.data : "Failed to create department.");
        } finally {
            setBusyId(null);
        }
    };

    const saveEdit = async (item) => {
        const name = editName.trim();
        if (!name) return;

        setBusyId(item.id);
        setError("");
        try {
            await api.put(`/api/admin/departments/${item.id}`, {
                id: item.id,
                name,
                isActive: item.isActive,
            });
            cancelEdit();
            await load();
        } catch (e) {
            console.error("Update department error:", e?.response?.status, e?.response?.data || e.message);
            setError(typeof e?.response?.data === "string" ? e.response.data : "Failed to update department.");
        } finally {
            setBusyId(null);
        }
    };

    const toggleActive = async (item) => {
        setBusyId(item.id);
        setError("");
        try {
            if (item.isActive) {
                // soft disable via DELETE
                await api.delete(`/api/admin/departments/${item.id}`);
            } else {
                // re-enable via PUT
                await api.put(`/api/admin/departments/${item.id}`, {
                    id: item.id,
                    name: item.name,
                    isActive: true,
                });
            }
            await load();
        } catch (e) {
            console.error("Toggle department error:", e?.response?.status, e?.response?.data || e.message);
            setError(typeof e?.response?.data === "string" ? e.response.data : "Failed to update department.");
        } finally {
            setBusyId(null);
        }
    };

    if (!isMaster) {
        return (
            <div className="lookup-wrap">
                <h1>Departments</h1>
                <p className="muted">Access denied. This page is for Master account only.</p>
            </div>
        );
    }

    if (loading) return <p>Loading departments...</p>;

    return (
        <div className="lookup-wrap">
            <div className="lookup-top">
                <div>
                    <h1>Departments</h1>
                    <p className="muted">Master-only: create, rename, enable/disable departments.</p>
                </div>
                <button className="ghost-btn" onClick={load} disabled={busyId !== null}>
                    Refresh
                </button>
            </div>

            {error && <div className="error-box">{error}</div>}

            <form className="create-row" onSubmit={create}>
                <input
                    placeholder="New department name..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={busyId === "create"}
                />
                <button type="submit" disabled={busyId === "create" || !newName.trim()}>
                    {busyId === "create" ? "Creating..." : "Create"}
                </button>
            </form>

            <div className="table-wrap">
                <table className="lookup-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th className="actions-col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => {
                            const isEditing = editId === item.id;
                            const isBusy = busyId === item.id;

                            return (
                                <tr key={item.id} className={!item.isActive ? "row-disabled" : ""}>
                                    <td>
                                        {isEditing ? (
                                            <input
                                                className="inline-input"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                disabled={isBusy}
                                            />
                                        ) : (
                                            <span className="name">{item.name}</span>
                                        )}
                                    </td>

                                    <td>
                                        <span className={`pill ${item.isActive ? "active" : "inactive"}`}>
                                            {item.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="actions">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    className="dark-btn"
                                                    onClick={() => saveEdit(item)}
                                                    disabled={isBusy || !editName.trim()}
                                                    type="button"
                                                >
                                                    {isBusy ? "Saving..." : "Save"}
                                                </button>
                                                <button className="ghost-btn" onClick={cancelEdit} disabled={isBusy} type="button">
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="ghost-btn" onClick={() => startEdit(item)} disabled={isBusy} type="button">
                                                    Edit
                                                </button>

                                                <button
                                                    className={item.isActive ? "danger-btn" : "dark-btn"}
                                                    onClick={() => toggleActive(item)}
                                                    disabled={isBusy}
                                                    type="button"
                                                >
                                                    {item.isActive ? (isBusy ? "Disabling..." : "Disable") : (isBusy ? "Enabling..." : "Enable")}
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {items.length === 0 && <div className="empty">No departments found.</div>}
            </div>
        </div>
    );
}

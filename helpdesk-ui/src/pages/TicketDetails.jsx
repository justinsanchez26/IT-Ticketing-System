import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import "../styles/ticketDetails.css";

const STATUS_OPTIONS = [
    { value: 0, label: "Open" },
    { value: 1, label: "InProgress" },
    { value: 2, label: "Resolved" },
    { value: 3, label: "Closed" },
];

export default function TicketDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const profile = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("profile") || "null");
        } catch {
            return null;
        }
    }, []);

    const isAdmin =
        profile?.role === "Master" ||
        profile?.role === "ITAdmin" ||
        profile?.role === "HRAdmin";

    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");

    const [agents, setAgents] = useState([]);
    const [selectedAssignee, setSelectedAssignee] = useState("");
    const [selectedStatus, setSelectedStatus] = useState(0);

    const [audit, setAudit] = useState([]);
    const [showAudit, setShowAudit] = useState(false);

    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const statusValueFromLabel = (label) =>
        STATUS_OPTIONS.find((x) => x.label === String(label))?.value ?? 0;

    const load = async () => {
        setLoading(true);
        setError("");

        try {
            const requests = [
                api.get(`/api/tickets/${id}`),
                api.get(`/api/tickets/${id}/comments`),
            ];

            if (isAdmin) {
                requests.push(api.get(`/api/users/agents`));
                requests.push(api.get(`/api/tickets/${id}/audit`));
            }

            const res = await Promise.all(requests);

            const t = res[0].data;
            const c = res[1].data;

            setTicket(t);
            setComments(c);

            if (isAdmin) {
                const a = res[2].data;
                const auditRes = res[3].data;

                setAgents(a || []);
                setAudit(auditRes || []);
                setSelectedStatus(statusValueFromLabel(t.status));
                setSelectedAssignee("");
            }
        } catch (e) {
            console.error("TicketDetails load error:", e?.response?.status, e?.response?.data || e.message);
            const msg =
                (typeof e?.response?.data === "string" && e.response.data) ||
                "Failed to load ticket details.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const addComment = async (e) => {
        e.preventDefault();
        const text = commentText.trim();
        if (!text) return;

        setBusy(true);
        setError("");

        try {
            await api.post(`/api/tickets/${id}/comments`, { commentText: text });
            setCommentText("");
            await load();
        } catch (e) {
            console.error("Add comment error:", e?.response?.status, e?.response?.data || e.message);
            setError(typeof e?.response?.data === "string" ? e.response.data : "Failed to add comment.");
        } finally {
            setBusy(false);
        }
    };

    const assignTicket = async () => {
        if (!selectedAssignee) return;

        setBusy(true);
        setError("");

        try {
            await api.put(`/api/tickets/${id}/assign`, { assignedToId: selectedAssignee });
            await load();
        } catch (e) {
            console.error("Assign error:", e?.response?.status, e?.response?.data || e.message);
            setError(typeof e?.response?.data === "string" ? e.response.data : "Failed to assign ticket.");
        } finally {
            setBusy(false);
        }
    };

    const updateStatus = async () => {
        setBusy(true);
        setError("");

        try {
            await api.put(`/api/tickets/${id}/status`, { status: Number(selectedStatus) });
            await load();
        } catch (e) {
            console.error("Status update error:", e?.response?.status, e?.response?.data || e.message);
            setError(typeof e?.response?.data === "string" ? e.response.data : "Failed to update status.");
        } finally {
            setBusy(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!ticket) return <p>Ticket not found.</p>;

    return (
        <div className="ticket-details">
            <div className="ticket-header">
                <button className="back-btn" onClick={() => navigate("/tickets")}>
                    ← Back
                </button>
                <h1>{ticket.ticketNumber}</h1>
            </div>

            <div className="ticket-card">
                <div className="ticket-title-row">
                    <h2>{ticket.title}</h2>
                    <div className="badges">
                        <span className={`badge status-${String(ticket.status).toLowerCase()}`}>
                            {ticket.status}
                        </span>
                        <span className={`badge prio-${String(ticket.priority).toLowerCase()}`}>
                            {ticket.priority}
                        </span>
                    </div>
                </div>

                <p className="desc">{ticket.description}</p>

                <div className="meta">
                    <div>
                        <span className="label">Department</span>
                        <span className="value">{ticket.department}</span>
                    </div>

                    <div>
                        <span className="label">Category</span>
                        <span className="value">{ticket.category}</span>
                    </div>

                    <div>
                        <span className="label">Requester</span>
                        <span className="value">{ticket.requester}</span>
                    </div>

                    <div>
                        <span className="label">Assigned To</span>
                        <span className="value">{ticket.assignedTo || "Unassigned"}</span>
                    </div>
                </div>

                {isAdmin && (
                    <>
                        <div className="admin-actions">
                            <div className="admin-box">
                                <label>Assign to</label>
                                <div className="row">
                                    <select
                                        value={selectedAssignee}
                                        onChange={(e) => setSelectedAssignee(e.target.value)}
                                        disabled={busy}
                                    >
                                        <option value="">Select agent...</option>
                                        {agents.map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.fullName} ({a.role})
                                            </option>
                                        ))}
                                    </select>
                                    <button onClick={assignTicket} disabled={busy || !selectedAssignee}>
                                        Assign
                                    </button>
                                </div>
                            </div>

                            <div className="admin-box">
                                <label>Update status</label>
                                <div className="row">
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        disabled={busy}
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button onClick={updateStatus} disabled={busy}>
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="audit-box">
                            <button
                                type="button"
                                className="audit-toggle"
                                onClick={() => setShowAudit(!showAudit)}
                            >
                                {showAudit ? "Hide Audit Log" : "Show Audit Log"}
                            </button>

                            {showAudit && (
                                <div className="audit-list">
                                    {audit.length === 0 ? (
                                        <p className="empty">No audit entries yet.</p>
                                    ) : (
                                        audit.map((a) => (
                                            <div className="audit-item" key={a.id}>
                                                <div className="audit-top">
                                                    <span className="audit-action">{a.action}</span>
                                                    <span className="audit-date">
                                                        {new Date(a.createdAt).toLocaleString()}
                                                    </span>
                                                </div>

                                                <div className="audit-values">
                                                    {a.oldValue && <span className="old">Old: {a.oldValue}</span>}
                                                    {a.newValue && <span className="new">New: {a.newValue}</span>}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="comments-card">
                <h3>Comments</h3>

                {comments.length === 0 ? (
                    <p className="empty">No comments yet.</p>
                ) : (
                    <div className="comment-list">
                        {comments.map((c) => (
                            <div className="comment" key={c.id}>
                                <div className="comment-top">
                                    <span className="comment-author">{c.user.fullName}</span>
                                    <span className="comment-date">
                                        {new Date(c.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="comment-text">{c.commentText}</div>
                            </div>
                        ))}
                    </div>
                )}

                <form className="comment-form" onSubmit={addComment}>
                    <textarea
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        disabled={busy}
                    />
                    <button type="submit" disabled={busy || !commentText.trim()}>
                        Add Comment
                    </button>
                </form>
            </div>
        </div>
    );
}

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

    const isAdmin = profile?.role === "Master" || profile?.role === "ITAdmin" || profile?.role === "HRAdmin";

    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");

    const [agents, setAgents] = useState([]);
    const [selectedAssignee, setSelectedAssignee] = useState("");
    const [selectedStatus, setSelectedStatus] = useState(null);

    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const requests = [
            api.get(`/api/tickets/${id}`),
            api.get(`/api/tickets/${id}/comments`),
        ];

        if (isAdmin) {
            requests.push(api.get(`/api/users/agents`));
        }

        const res = await Promise.all(requests);

        const t = res[0].data;
        const c = res[1].data;

        setTicket(t);
        setComments(c);

        if (isAdmin) {
            const a = res[2].data;
            setAgents(a);
            setSelectedAssignee(""); // keep unselected by default
            setSelectedStatus(
                STATUS_OPTIONS.find((x) => x.label === String(t.status))?.value ?? 0
            );
        }

        setLoading(false);
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const addComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setBusy(true);
        try {
            await api.post(`/api/tickets/${id}/comments`, {
                commentText: commentText.trim(),
            });
            setCommentText("");
            await load();
        } finally {
            setBusy(false);
        }
    };

    const assignTicket = async () => {
        if (!selectedAssignee) return;
        setBusy(true);
        try {
            await api.put(`/api/tickets/${id}/assign`, {
                assignedToId: selectedAssignee,
            });
            await load();
        } finally {
            setBusy(false);
        }
    };

    const updateStatus = async () => {
        if (selectedStatus === null || selectedStatus === undefined) return;
        setBusy(true);
        try {
            await api.put(`/api/tickets/${id}/status`, {
                status: Number(selectedStatus),
            });
            await load();
        } finally {
            setBusy(false);
        }
    };

    if (loading) return <p>Loading...</p>;
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
                    <div className="admin-actions">
                        <div className="admin-box">
                            <label>Assign to</label>
                            <div className="row">
                                <select
                                    value={selectedAssignee}
                                    onChange={(e) => setSelectedAssignee(e.target.value)}
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
                                    value={selectedStatus ?? 0}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
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

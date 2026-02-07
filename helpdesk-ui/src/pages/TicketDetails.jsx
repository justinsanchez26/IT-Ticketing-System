import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/ticketDetails.css";

export default function TicketDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const [tRes, cRes] = await Promise.all([
            api.get(`/api/tickets/${id}`),
            api.get(`/api/tickets/${id}/comments`)
        ]);

        setTicket(tRes.data);
        setComments(cRes.data);
        setLoading(false);
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const addComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        await api.post(`/api/tickets/${id}/comments`, {
            commentText: commentText.trim(),
        });

        setCommentText("");
        await load();
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
                <h2>{ticket.title}</h2>
                <p className="desc">{ticket.description}</p>

                <div className="meta">
                    <div>
                        <span className="label">Status</span>
                        <span className="value">{ticket.status}</span>
                    </div>

                    <div>
                        <span className="label">Priority</span>
                        <span className="value">{ticket.priority}</span>
                    </div>

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
                    />
                    <button type="submit">Add Comment</button>
                </form>
            </div>
        </div>
    );
}

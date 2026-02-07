import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/tickets.css";

const STATUS_OPTIONS = ["All", "Open", "InProgress", "Resolved", "Closed"];
const PRIORITY_OPTIONS = ["All", "Low", "Medium", "High", "Urgent"];

export default function Tickets() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [priority, setPriority] = useState("All");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const res = await api.get("/api/tickets");
            setTickets(res.data || []);
            setLoading(false);
        };
        load();
    }, []);

    const filtered = useMemo(() => {
        const s = search.trim().toLowerCase();

        return tickets.filter((t) => {
            const matchSearch =
                !s ||
                String(t.ticketNumber).toLowerCase().includes(s) ||
                String(t.title).toLowerCase().includes(s);

            const matchStatus = status === "All" || String(t.status) === status;
            const matchPriority = priority === "All" || String(t.priority) === priority;

            return matchSearch && matchStatus && matchPriority;
        });
    }, [tickets, search, status, priority]);

    return (
        <div>
            <div className="tickets-top">
                <h1>Tickets</h1>

                <div className="filters">
                    <input
                        className="search"
                        placeholder="Search ticket # or title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        {STATUS_OPTIONS.map((x) => (
                            <option key={x} value={x}>{x}</option>
                        ))}
                    </select>

                    <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                        {PRIORITY_OPTIONS.map((x) => (
                            <option key={x} value={x}>{x}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <p>No tickets found.</p>
                    <small>Try changing filters or search.</small>
                </div>
            ) : (
                <table className="ticket-table">
                    <thead>
                        <tr>
                            <th>Ticket #</th>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((t) => (
                            <tr key={t.id} onClick={() => navigate(`/tickets/${t.id}`)}>
                                <td className="mono">{t.ticketNumber}</td>
                                <td>{t.title}</td>
                                <td>
                                    <span className={`badge status-${String(t.status).toLowerCase()}`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge prio-${String(t.priority).toLowerCase()}`}>
                                        {t.priority}
                                    </span>
                                </td>
                                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

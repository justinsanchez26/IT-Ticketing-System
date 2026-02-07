import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/tickets.css";

export default function Tickets() {
    const [tickets, setTickets] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/api/tickets").then((res) => setTickets(res.data));
    }, []);

    return (
        <div>
            <h1>Tickets</h1>

            <table className="ticket-table">
                <thead>
                    <tr>
                        <th>Ticket #</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Priority</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map((t) => (
                        <tr key={t.id} onClick={() => navigate(`/tickets/${t.id}`)}>
                            <td>{t.ticketNumber}</td>
                            <td>{t.title}</td>
                            <td>{t.status}</td>
                            <td>{t.priority}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

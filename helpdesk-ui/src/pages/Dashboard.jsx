import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "../styles/dashboard.css";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
    const profile = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("profile") || "null");
        } catch {
            return null;
        }
    }, []);

    const isManager =
        profile?.role === "Master" ||
        profile?.role === "ITAdmin" ||
        profile?.role === "HRAdmin";

    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState("");

    const normalize = (byStatus) => {
        const base = { Open: 0, InProgress: 0, Resolved: 0, Closed: 0 };
        (byStatus || []).forEach((x) => {
            if (x.status in base) base[x.status] = x.count;
        });
        return base;
    };

    useEffect(() => {
        const load = async () => {
            if (!isManager) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                const res = await api.get("/api/reports/tickets-summary");
                setSummary(res.data);
            } catch (e) {
                console.error("Summary error:", e?.response?.status, e?.response?.data || e.message);
                setError("Failed to load ticket summary.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [isManager]);

    if (!isManager) {
        return (
            <div className="dash-wrap">
                <h1>Dashboard</h1>
                <p className="muted">Summary is available for Admin and Master accounts only.</p>
            </div>
        );
    }

    if (loading) return <p>Loading summary...</p>;
    if (error) return <p>{error}</p>;
    if (!summary) return <p>No data.</p>;

    const s = normalize(summary.byStatus);
    const total = summary.total ?? 0;

    const labels = ["Open", "InProgress", "Resolved", "Closed"];
    const values = [s.Open, s.InProgress, s.Resolved, s.Closed];

    const chartData = {
        labels,
        datasets: [
            {
                label: "Tickets",
                data: values,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } },
        },
    };

    return (
        <div className="dash-wrap">
            <div className="dash-top">
                <div>
                    <h1>Dashboard</h1>
                    <p className="muted">Ticket summary (all departments)</p>
                </div>
            </div>

            <div className="cards">
                <div className="card">
                    <div className="card-title">Total</div>
                    <div className="card-value">{total}</div>
                </div>

                <div className="card">
                    <div className="card-title">Open</div>
                    <div className="card-value">{s.Open}</div>
                </div>

                <div className="card">
                    <div className="card-title">In Progress</div>
                    <div className="card-value">{s.InProgress}</div>
                </div>

                <div className="card">
                    <div className="card-title">Resolved</div>
                    <div className="card-value">{s.Resolved}</div>
                </div>

                <div className="card">
                    <div className="card-title">Closed</div>
                    <div className="card-value">{s.Closed}</div>
                </div>
            </div>

            <div className="panel chart-panel">
                <div className="panel-top">
                    <h3>Status chart</h3>
                    <span className="muted small">Counts by ticket status</span>
                </div>

                <div className="chart-wrap">
                    <Bar data={chartData} options={chartOptions} />
                </div>
            </div>

            <div className="panel">
                <h3>Status breakdown</h3>

                <div className="rows">
                    <div className="row">
                        <span className="pill open">Open</span>
                        <span className="count">{s.Open}</span>
                    </div>
                    <div className="row">
                        <span className="pill inprogress">InProgress</span>
                        <span className="count">{s.InProgress}</span>
                    </div>
                    <div className="row">
                        <span className="pill resolved">Resolved</span>
                        <span className="count">{s.Resolved}</span>
                    </div>
                    <div className="row">
                        <span className="pill closed">Closed</span>
                        <span className="count">{s.Closed}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

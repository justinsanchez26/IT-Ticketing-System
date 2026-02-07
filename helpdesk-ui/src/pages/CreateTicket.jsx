import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/form.css";

export default function CreateTicket() {
    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingLookups, setLoadingLookups] = useState(true);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        title: "",
        description: "",
        departmentId: "",
        categoryId: "",
        priority: 1,
    });

    useEffect(() => {
        const loadLookups = async () => {
            try {
                setError("");
                setLoadingLookups(true);

                const [dRes, cRes] = await Promise.all([
                    api.get("/api/lookup/departments"),
                    api.get("/api/lookup/categories"),
                ]);

                setDepartments(dRes.data || []);
                setCategories(cRes.data || []);
            } catch (e) {
                console.error("Lookup load error:", e?.response?.status, e?.response?.data || e.message);
                setError("Failed to load dropdown data. Please re-login and refresh.");
            } finally {
                setLoadingLookups(false);
            }
        };

        loadLookups();
    }, []);

    const submit = async (e) => {
        e.preventDefault();

        if (!form.departmentId || !form.categoryId) {
            setError("Please select Department and Category.");
            return;
        }

        try {
            setError("");
            const res = await api.post("/api/tickets", form);
            alert(`Ticket created: ${res.data.ticketNumber ?? "OK"}`);
            navigate("/tickets");
        } catch (e) {
            console.error("Create ticket error:", e?.response?.status, e?.response?.data || e.message);
            setError(typeof e?.response?.data === "string" ? e.response.data : "Failed to create ticket.");
        }
    };

    return (
        <form className="form" onSubmit={submit}>
            <h1>Create Ticket</h1>

            {error && <p className="form-error">{error}</p>}

            <input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            {/* Department dropdown */}
            <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                disabled={loadingLookups}
            >
                <option value="">Select Department</option>
                {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                        {d.name}
                    </option>
                ))}
            </select>

            {/* Category dropdown */}
            <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                disabled={loadingLookups}
            >
                <option value="">Select Category</option>
                {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </select>

            <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
            >
                <option value={0}>Low</option>
                <option value={1}>Medium</option>
                <option value={2}>High</option>
                <option value={3}>Urgent</option>
            </select>

            <button type="submit" disabled={loadingLookups}>
                Create
            </button>
        </form>
    );
}

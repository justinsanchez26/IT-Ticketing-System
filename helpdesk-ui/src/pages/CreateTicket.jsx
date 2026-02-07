import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/form.css";
import useToast from "../ui/toast/useToast";


export default function CreateTicket() {
    const navigate = useNavigate();
    const { show } = useToast();

    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingLookups, setLoadingLookups] = useState(true);
    const [saving, setSaving] = useState(false);
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
                show("Failed to load dropdowns.", "error");
            } finally {
                setLoadingLookups(false);
            }
        };

        loadLookups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submit = async (e) => {
        e.preventDefault();

        if (!form.departmentId || !form.categoryId) {
            const msg = "Please select Department and Category.";
            setError(msg);
            show(msg, "error");
            return;
        }

        setSaving(true);
        try {
            setError("");
            const res = await api.post("/api/tickets", form);

            // Your API might return ticketNumber string or objects
            const ticketNumber =
                (typeof res.data === "string" && res.data) ||
                res.data?.ticketNumber ||
                "Ticket created";

            show(`Created: ${ticketNumber}`, "success");
            navigate("/tickets");
        } catch (e) {
            console.error("Create ticket error:", e?.response?.status, e?.response?.data || e.message);
            const msg =
                typeof e?.response?.data === "string" ? e.response.data : "Failed to create ticket.";
            setError(msg);
            show(msg, "error");
        } finally {
            setSaving(false);
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
                disabled={saving}
            />

            <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={saving}
            />

            <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                disabled={loadingLookups || saving}
            >
                <option value="">Select Department</option>
                {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                        {d.name}
                    </option>
                ))}
            </select>

            <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                disabled={loadingLookups || saving}
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
                disabled={saving}
            >
                <option value={0}>Low</option>
                <option value={1}>Medium</option>
                <option value={2}>High</option>
                <option value={3}>Urgent</option>
            </select>

            <button type="submit" disabled={loadingLookups || saving}>
                {saving ? "Creating..." : "Create"}
            </button>
        </form>
    );
}

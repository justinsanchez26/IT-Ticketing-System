import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/form.css";

export default function CreateTicket() {
    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        title: "",
        description: "",
        departmentId: "",
        categoryId: "",
        priority: 1,
    });

    useEffect(() => {
        api.get("/api/lookup/departments").then((r) => setDepartments(r.data));
        api.get("/api/lookup/categories").then((r) => setCategories(r.data));
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        await api.post("/api/tickets", form);
        alert("Ticket created");
    };

    return (
        <form className="form" onSubmit={submit}>
            <h1>Create Ticket</h1>

            <input
                placeholder="Title"
                onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <textarea
                placeholder="Description"
                onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <select onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
                <option>Select Department</option>
                {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                ))}
            </select>

            <select onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option>Select Category</option>
                {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>

            <select onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}>
                <option value={0}>Low</option>
                <option value={1}>Medium</option>
                <option value={2}>High</option>
                <option value={3}>Urgent</option>
            </select>

            <button>Create</button>
        </form>
    );
}

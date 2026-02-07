import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Tickets from "./pages/Tickets";
import CreateTicket from "./pages/CreateTicket";
import TicketDetails from "./pages/TicketDetails";
import Dashboard from "./pages/Dashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminDepartments from "./pages/AdminDepartments";
import AdminCategories from "./pages/AdminCategories";
import Forbidden from "./pages/Forbidden";

import "./styles/layout.css";

function AppLayout() {
    return (
        <div className="layout">
            <Sidebar />
            <div className="content">
                <Routes>
                    <Route path="/tickets" element={<Tickets />} />
                    <Route path="/tickets/new" element={<CreateTicket />} />
                    <Route path="/tickets/:id" element={<TicketDetails />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/departments" element={<AdminDepartments />} />
                    <Route path="/admin/categories" element={<AdminCategories />} />
                    <Route path="/forbidden" element={<Forbidden />} />
                    <Route path="*" element={<Navigate to="/tickets" replace />} />
                </Routes>
            </div>
        </div>
    );
}

export default function App() {
    const token = localStorage.getItem("access_token");

    return (
        <Routes>
            <Route
                path="/"
                element={token ? <Navigate to="/tickets" replace /> : <Login />}
            />

            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Tickets from "./pages/Tickets";
import CreateTicket from "./pages/CreateTicket";
import TicketDetails from "./pages/TicketDetails";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
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
                    <Route path="*" element={<Navigate to="/tickets" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </div>
        </div>
    );
}

export default function App() {
    const token = localStorage.getItem("access_token");

    return (
        <BrowserRouter>
            <Routes>
                {/* login route */}
                <Route
                    path="/"
                    element={token ? <Navigate to="/tickets" replace /> : <Login />}
                />

                {/* everything else protected */}
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

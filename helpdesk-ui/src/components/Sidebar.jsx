import { Link, useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import "../styles/sidebar.css";

export default function Sidebar() {
    const navigate = useNavigate();
    const profile = JSON.parse(localStorage.getItem("profile") || "null");
    const isManager = profile?.role === "Master" || profile?.role === "ITAdmin" || profile?.role === "HRAdmin";
    const isMaster = profile?.role === "Master";


    const logout = () => {
        // real google logout (clears google session for this app)
        googleLogout();

        // clear your app session
        localStorage.removeItem("access_token");
        localStorage.removeItem("profile");

        // go back to login
        navigate("/", { replace: true });
    };

    return (
        <div className="sidebar">
            <h2>HelpDesk</h2>

            <div className="user-info">
                <p>{profile?.email}</p>
                <small>{profile?.role}</small>
            </div>

            <nav>
                {isManager && <Link to="/dashboard">Dashboard</Link>}
                {isMaster && <Link to="/admin/users">Users & Roles</Link>}
                {isMaster && <Link to="/admin/departments">Departments</Link>}
                {isMaster && <Link to="/admin/categories">Categories</Link>}
                <Link to="/tickets">Tickets</Link>
                <Link to="/tickets/new">Create Ticket</Link>
            </nav>

            <button className="logout" onClick={logout}>
                Logout
            </button>
        </div>
    );
}

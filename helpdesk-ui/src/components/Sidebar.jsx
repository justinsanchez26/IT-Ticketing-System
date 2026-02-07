import { Link, useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import "../styles/sidebar.css";

export default function Sidebar() {
    const navigate = useNavigate();
    const profile = JSON.parse(localStorage.getItem("profile") || "null");

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
                <Link to="/tickets">Tickets</Link>
                <Link to="/tickets/new">Create Ticket</Link>
            </nav>

            <button className="logout" onClick={logout}>
                Logout
            </button>
        </div>
    );
}

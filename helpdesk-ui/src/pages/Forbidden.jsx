import { useNavigate } from "react-router-dom";
import "../styles/forbidden.css";

export default function Forbidden() {
    const navigate = useNavigate();

    return (
        <div className="forbidden-wrap">
            <div className="forbidden-card">
                <h1>Access denied</h1>
                <p>You do not have permission to view this page.</p>

                <div className="forbidden-actions">
                    <button className="ghost-btn" onClick={() => navigate(-1)} type="button">
                        Go back
                    </button>
                    <button className="dark-btn" onClick={() => navigate("/tickets")} type="button">
                        Go to Tickets
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle } from "../api/auth";
import "../styles/login.css";

export default function Login() {
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        try {
            setError("");
            const idToken = credentialResponse.credential;

            const data = await loginWithGoogle(idToken);

            localStorage.setItem("access_token", data.token);
            localStorage.setItem("profile", JSON.stringify(data.profile));

            navigate("/tickets", { replace: true });
        } catch (err) {
            const msg = err?.response?.data || err?.message || "Login failed.";
            setError(typeof msg === "string" ? msg : JSON.stringify(msg));
        }
    };

    return (
        <div className="login-wrap">
            <div className="login-card">
                <h2>HelpDesk Ticketing</h2>
                <p className="muted">Sign in with Google to continue.</p>

                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => setError("Google sign-in failed.")}
                />

                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
}

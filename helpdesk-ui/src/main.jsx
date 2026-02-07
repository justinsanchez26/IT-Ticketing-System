import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ToastProvider from "./ui/toast/ToastProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <ToastProvider>
                <App />
            </ToastProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>
);

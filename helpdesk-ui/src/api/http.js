import axios from "axios";
import { logout } from "./auth";

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:7030",
});

// Attach JWT to every request
http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token"); // KEEP THIS CONSISTENT
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auto logout on auth failure
http.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;

        if (status === 401 || status === 403) {
            logout();

            // hard redirect so app resets completely
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default http;

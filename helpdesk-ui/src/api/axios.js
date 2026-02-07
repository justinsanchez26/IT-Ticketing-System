import axios from "axios";
import { logout } from "./auth";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:7030",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;

        //  401: invalid/expired token  logout + redirect to login
        if (status === 401) {
            logout();
            if (window.location.pathname !== "/") {
                window.location.href = "/";
            }
            return Promise.reject(err);
        }

        //  403: logged in but not allowed  go to forbidden (no logout)
        if (status === 403) {
            if (window.location.pathname !== "/forbidden") {
                window.location.href = "/forbidden";
            }
            return Promise.reject(err);
        }

        return Promise.reject(err);
    }
);

export default api;

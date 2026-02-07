import axios from "axios";
import { logout } from "./auth";

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:7030",
});

http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

http.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;

        if (status === 401) {
            logout();
            if (window.location.pathname !== "/login") window.location.href = "/login";
        }

        if (status === 403) {
            // don’t logout; just send to access denied
            if (window.location.pathname !== "/forbidden") window.location.href = "/forbidden";
        }

        return Promise.reject(error);
    }
);

export default http;

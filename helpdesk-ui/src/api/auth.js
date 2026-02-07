import http from "./http";
import { googleLogout } from "@react-oauth/google";

export async function loginWithGoogle(idToken) {
    const res = await http.post("/api/auth/google", { idToken });
    return res.data;
}

export function clearSession() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("profile");
}

export function logout() {
    try {
        googleLogout(); // real Google logout
    } catch {
        // Google SDK may not be initialized; safe to ignore
    }

    clearSession();
}

import http from "./http";

export async function loginWithGoogle(idToken) {
  const res = await http.post("/api/auth/google", { idToken });
  return res.data; // { token, profile }
}

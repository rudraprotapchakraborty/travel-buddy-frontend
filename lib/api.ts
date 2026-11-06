import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
  timeout: 20_000,
});

// Attach the saved token to every request so pages don't have to.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && !config.headers.Authorization) {
    try {
      const token = localStorage.getItem("tb_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      /* storage unavailable */
    }
  }
  return config;
});

/** Turns any thrown API error into a message that can be shown to the user. */
export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again.") {
  const e = err as AxiosError<any>;
  if (e?.code === "ERR_NETWORK" || (e?.isAxiosError && !e.response)) {
    return "Unable to reach the server. Please check your connection.";
  }
  const data = e?.response?.data;
  const fieldErrors = data?.details?.fieldErrors;
  if (fieldErrors && typeof fieldErrors === "object") {
    const parts = Object.entries(fieldErrors).flatMap(([field, msgs]) =>
      (Array.isArray(msgs) ? msgs : [msgs]).map((m) => `${field}: ${m}`)
    );
    if (parts.length) return parts.join(" | ");
  }
  if (typeof data?.message === "string") return data.message;
  return fallback;
}

export default api;

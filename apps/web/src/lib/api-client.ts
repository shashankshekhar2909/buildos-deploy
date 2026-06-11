import axios from "axios";

// Empty baseURL = relative to Next.js origin → hits /api/* routes directly
export const apiClient = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

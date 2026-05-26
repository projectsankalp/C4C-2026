/**
 * Thin wrapper around Axios with the backend base URL pre-configured.
 * All HTTP -> backend goes through here so we have one place to add auth, retries, logging.
 */
import axios, { AxiosInstance } from "axios";
import { config } from "../config";

export const api: AxiosInstance = axios.create({
  baseURL: config.backendUrl,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    "x-source": "wa-bot",
  },
});

// Surface useful error info without leaking secrets in the log.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url;
    const code = error?.code;
    error.summary = `${error?.config?.method?.toUpperCase() || "REQ"} ${url} → ${status || code || "ERR"}`;
    return Promise.reject(error);
  },
);

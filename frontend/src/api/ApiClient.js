import axios from "axios";
import { useAuth } from "../stores/useAuth";

const baseURL =  import.meta.env.MODE !== "production" ? 
  "http://localhost:8000/" :
 "https://api.gosaasbuild.com" ;

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      const token = await useAuth.getState().refreshAccess();
      original.headers.Authorization = `Bearer ${token}`;

      return apiClient(original);
    }

    if (import.meta.env.MODE !== "production") {
      console.error("API Error:", err);
    }

    throw err;
  }
);

export default apiClient;

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';
let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => { accessToken = token || null; };
export const getAccessToken = () => accessToken;

const api = axios.create({ baseURL, timeout: 15_000, withCredentials: true });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

const refreshAccess = async () => {
  if (!refreshPromise) {
    refreshPromise = axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true, timeout: 15_000, headers: { 'X-KOBO-Refresh': '1' } })
      .then((response) => { setAccessToken(response.data.token); return response.data; })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
};

api.interceptors.response.use((response) => response, async (error) => {
  const original = error.config;
  const path = String(original?.url || '');
  if (error.response?.status === 401 && original && !original._retried && !path.includes('/auth/login') && !path.includes('/auth/register') && !path.includes('/auth/refresh')) {
    original._retried = true;
    try { await refreshAccess(); original.headers.Authorization = `Bearer ${accessToken}`; return api(original); }
    catch { setAccessToken(null); }
  }
  return Promise.reject(error);
});

export { refreshAccess };
export default api;

import axios from 'axios';

interface RefreshTokenResponse {
  accessToken: string;
}

let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use(config => {
  if (accessToken && config.headers) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

// Response: nếu token hết hạn, tự gọi refresh
api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Gọi refresh-token API và ép kiểu cho response
        const res = await api.post<RefreshTokenResponse>('/auth/refresh-token');
        
        setAccessToken(res.data.accessToken);
        
        // Kiểm tra headers trước khi truy cập
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
        }
        
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

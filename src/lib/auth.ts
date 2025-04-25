import axios from 'axios';
import Cookies from 'js-cookie'; 

interface RefreshTokenResponse {
  accessToken: string;
}

let accessToken: string | null = null;



export const setAccessToken = (token: string) => {
  accessToken = token;
  localStorage.setItem('accessToken', token);
};

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, 
});

// Thêm interceptor cho mỗi request
api.interceptors.request.use(config => {
  if (accessToken && config.headers) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

// Xử lý lỗi token hết hạn (401)
api.interceptors.response.use(
  response => response, // Tiếp tục bình thường nếu không có lỗi
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra nếu có lỗi 401 và token chưa được thử làm mới
    if ((error.response?.status === 401 && !originalRequest._retry) || error.response?.data?.message === "Invalid token.") {
      originalRequest._retry = true;

      try {
        // Gọi API refresh token mà không cần truyền refresh token trong header
        const res = await api.post<RefreshTokenResponse>("/auth/refresh-token", {}, {
          // Không cần thêm 'Authorization' header, server sẽ lấy từ cookies
        });

        setAccessToken(res.data.accessToken);

        // Thêm token mới vào header của request gốc
        originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;

        // Gửi lại request ban đầu với token mới
        return api(originalRequest);
      } catch (err) {
        // Nếu không thể làm mới token, thông báo lỗi và yêu cầu đăng nhập lại
        console.error("❌ Failed to refresh token, logging out...");
        return Promise.reject("Failed to refresh token");
      }
    }

    return Promise.reject(error); 
  }
);

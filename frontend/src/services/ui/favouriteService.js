import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Yêu cầu gửi đi:', config); // Log để kiểm tra yêu cầu
    return config;
  },
  (error) => Promise.reject(error)
);

export const favouriteService = {
  getFavourites: async () => {
    try {
      const response = await axiosInstance.get('/favourites');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách yêu thích:', error.response?.data || error.message);
      throw error;
    }
  },

  addFavourite: async (favouritable_id, favouritable_type) => {
    try {
      console.log('Dữ liệu gửi đi:', { favouritable_id, favouritable_type }); // Log để kiểm tra dữ liệu
      const response = await axiosInstance.post('/favourites', {
        favouritable_id,
        favouritable_type,
      });
      console.log('Phản hồi từ addFavourite:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm yêu thích:', error.response?.data || error.message);
      throw error;
    }
  },

  updateFavourite: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/favourites/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật yêu thích:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteFavourite: async (id) => {
    try {
      const response = await axiosInstance.delete(`/favourites/${id}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xóa yêu thích:', error.response?.data || error.message);
      throw error;
    }
  },
};
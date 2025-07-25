import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Tạo instance của axios với header Authorization
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để thêm token vào mỗi yêu cầu
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Lấy token từ localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
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
            console.error('Error fetching favourites:', error.response?.data || error.message);
            throw error;
        }
    },

    addFavourite: async (favouritable_id, favouritable_type) => {
        try {
            console.log('Sending data:', { favouritable_id, favouritable_type });
            const response = await axiosInstance.post('/favourites', {
                favouritable_id,
                favouritable_type,
            });
            return response.data;
        } catch (error) {
            console.error('Error adding favourite:', error.response?.data || error.message);
            throw error;
        }
    },

    updateFavourite: async (id, data) => {
        try {
            const response = await axiosInstance.put(`/favourites/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating favourite:', error.response?.data || error.message);
            throw error;
        }
    },

    deleteFavourite: async (id) => {
        try {
            const response = await axiosInstance.delete(`/favourites/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting favourite:', error.response?.data || error.message);
            throw error;
        }
    },
};
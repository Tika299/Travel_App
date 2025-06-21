// src/services/checkinPlaceService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // URL gốc của API Laravel

// 📍 Lấy tất cả địa điểm check-in
export const getAllCheckinPlaces = () => {
  return axios.get(`${API_URL}/checkin-places`);
};

// 📍 Lấy chi tiết một địa điểm theo ID
export const getCheckinPlaceById = (id) => {
  return axios.get(`${API_URL}/checkin-places/${id}`);
};

// ➕ Thêm mới địa điểm
export const createCheckinPlace = (data) => {
  return axios.post(`${API_URL}/checkin-places`, data);
};

// 🔁 Cập nhật địa điểm theo ID
export const updateCheckinPlace = (id, data) => {
  if (data instanceof FormData) {
    data.append('_method', 'PUT'); // Laravel expects _method override when using POST with FormData
    return axios.post(`${API_URL}/checkin-places/${id}`, data);
  } else {
    return axios.put(`${API_URL}/checkin-places/${id}`, data); // For plain JSON
  }
};

// 🗑️ Xóa địa điểm theo ID
export const deleteCheckinPlace = (id) => {
  return axios.delete(`${API_URL}/checkin-places/${id}`);
};

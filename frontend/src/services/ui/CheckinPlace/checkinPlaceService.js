// src/services/checkinPlaceService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // URL gốc của API Laravel

// 📍 Lấy tất cả địa điểm check-in
export const getAllCheckinPlaces = () => axios.get(`${API_URL}/checkin-places`);

// 📍 Lấy chi tiết một địa điểm theo ID
export const getCheckinPlaceById = (id) => axios.get(`${API_URL}/checkin-places/${id}`);

// ➕ Thêm mới địa điểm
export const createCheckinPlace = (data) => axios.post(`${API_URL}/checkin-places`, data);

// 🔁 Cập nhật địa điểm theo ID

export const updateCheckinPlace = (id, data) => axios.post(`${API_URL}/checkin-places/${id}`, data);

// 🗑️ Xóa địa điểm theo ID
export const deleteCheckinPlace = (id) => axios.delete(`${API_URL}/checkin-places/${id}`);
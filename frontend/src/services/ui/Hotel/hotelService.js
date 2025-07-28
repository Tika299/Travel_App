import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/hotels';

export const getAllHotels = (perPage = 10, page = 1) => {
  return axios.get(`${API_BASE_URL}?per_page=${perPage}&page=${page}`);
};

export const getHotelById = (id) => {
  return axios.get(`${API_BASE_URL}/${id}`);
};

export const createHotel = (hotelData) => {
  return axios.post(API_BASE_URL, hotelData);
};

export const updateHotel = (id, hotelData) => {
  return axios.put(`${API_BASE_URL}/${id}`, hotelData);
};

export const deleteHotel = (id) => {
  return axios.delete(`${API_BASE_URL}/${id}`);
};

export const getSuggestedHotels = () => {
  return axios.get(`${API_BASE_URL}/suggested`);
};

export const getPopularHotels = () => {
  return axios.get(`${API_BASE_URL}/popular`);
};
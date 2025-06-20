// src/services/transportCompanyService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const getAllTransportCompanies = () => axios.get(`${API_URL}/transport-companies`);
export const getTransportCompanyById = (id) => axios.get(`${API_URL}/transport-companies/${id}`);
export const createTransportCompany = (data) => axios.post(`${API_URL}/transport-companies`, data);
export const updateTransportCompany = (id, data) => axios.put(`${API_URL}/transport-companies/${id}`, data);
export const deleteTransportCompany = (id) => axios.delete(`${API_URL}/transport-companies/${id}`);

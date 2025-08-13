// src/services/ui/TransportCompany/transportCompanyService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; 

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getAllTransportCompanies = () => api.get(`/transport-companies`);
export const getTransportCompanyById = (id) => api.get(`/transport-companies/${id}`);
export const createTransportCompany = (data) => api.post(`/transport-companies`, data);
export const updateTransportCompany = (id, data) => api.put(`/transport-companies/${id}`, data);
export const deleteTransportCompany = (id) => api.delete(`/transport-companies/${id}`);
export const getReviewsForTransportCompany = (companyId) => api.get(`/transport-companies/${companyId}/reviews`);

export const importTransportCompanies = (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post(`/transport-companies/import`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
};
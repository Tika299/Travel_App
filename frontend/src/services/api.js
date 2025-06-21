import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

export const restaurantAPI = {
  getAll: (params = {}) => api.get("/Restaurant", { params }),
  getById: (id) => api.get(`/Restaurant/${id}`),
  getDishes: (restaurantId) => api.get(`/Restaurant/${restaurantId}/dishes`),
  create: (data) => api.post("/Restaurant", data),
  getReviews: (id, params = {}) => api.get(`/Restaurant/${id}`, { params }),
  getReviewStats: (id) => api.get(`/Restaurant/${id}`),
  createReview: (id, data) => api.post(`/Restaurant/${id}`, data),
}
export const itinerariesAPI = {
  getAll: (params) => api.get("/itineraries", { params }),
  getById: (id) => api.get(`/itineraries/${id}`),
  create: (data) => api.post("/itineraries", data),
  update: (id, data) => api.put(`/itineraries/${id}`, data),
  delete: (id) => api.delete(`/itineraries/${id}`),
};

export default api

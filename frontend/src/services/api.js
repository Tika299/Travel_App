import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const ApiService = {
  getDishes: (params = {}) => api.get("/dishe?page=${page}", { params }),
  getDish: (id) => api.get(`/dishe/${id}`),
  createDish: (data) =>
    api.post("/dishe", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  updateDish: (id, data) => {
    data.append("_method", "PUT");
    return api.post(`/dishe/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteDish: (id) => api.delete(`/dishe/delete/${id}`),
  getRestaurants: () => api.get("/Restaurant"),
  searchDishes: (query) => api.get("/dishe", { params: { search: query } }),
  getBestSellerDishes: () => api.get("/dishes/best-sellers"),
  getDishesByRestaurant: (restaurantId) =>
    api.get("/dishe", { params: { restaurant_id: restaurantId } }),
  bulkDelete: (ids) =>
    api.delete("/dishe/bulk-delete", {
      data: { ids },
    }),
};

export const restaurantAPI = {
  getAll: (params = {}) => api.get("/Restaurant", { params }),
  getById: (id) => api.get(`/Restaurant/${id}`),
  getDishes: (restaurantId) => api.get(`/Restaurant/${restaurantId}/dishes`),
  create: (data) => api.post("/Restaurant", data),
  getReviews: (id) =>
    api.get(`/Restaurant/${id}/reviews`, {
      params: {
        reviewable_type: "App\\Models\\Restaurant",
        reviewable_id: id,
      },
    }),
  getReviewStats: (id) =>
    api.get(`/Restaurant/${id}/reviews/stats`, {
      params: {
        type: "App\\Models\\Restaurant",
      },
    }),
  createReview: (id, data) => api.post(`/Restaurant/${id}`, data),
};

export const itinerariesAPI = {
  getAll: (params) => api.get("/itineraries", { params }),
  getById: (id) => api.get(`/itineraries/${id}`),
  create: (data) => api.post("/itineraries", data),
  update: (id, data) => api.put(`/itineraries/${id}`, data),
  delete: (id) => api.delete(`/itineraries/${id}`),
};

export const locationAPI = {
  getAll: (params = {}) => api.get("/Location", { params }),
  getById: (id) => api.get(`/Location/${id}`),
  create: (data) => api.post("/Location", data),
  update: (id, data) => api.put(`/Location/${id}`, data),
  delete: (id) => api.delete(`/Location/${id}`),
  getFeatured: (params = {}) => api.get("/Location/featured", { params }),
  getNearby: (params = {}) => api.get("/Location/nearby", { params }),
  getReviews: (id, params = {}) =>
    api.get(`/Location/${id}/reviews`, { params }),
  createReview: (id, data) => api.post(`/Location/${id}/reviews`, data),
};

export default api;

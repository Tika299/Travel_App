import axios from "axios"

// Cấu hình API cho kết nối với backend Laravel
const API_BASE_URL = "http://localhost:8000/api";

const axiosApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const restaurantAPI = {
  getAll: (params = {}) => axiosApi.get("/Restaurant", { params }),
  getById: (id) => axiosApi.get(`/Restaurant/${id}`),
  getDishes: (restaurantId) => axiosApi.get(`/Restaurant/${restaurantId}/dishes`),
  create: (data) => axiosApi.post("/Restaurant", data),

  getReviews: (id) =>
  axiosApi.get(`/Restaurant/${id}/reviews`, {
    params: {
      reviewable_type: "App\\Models\\Restaurant",
      reviewable_id: id,
    },
  }),

getReviewStats: (id) =>
  axiosApi.get(`/Restaurant/${id}/reviews/stats`, {
    params: {
      type: "App\\Models\\Restaurant",
    },
  }),
  createReview: (id, data) => axiosApi.post(`/Restaurant/${id}`, data),
}
export const itinerariesAPI = {
  getAll: (params) => axiosApi.get("/itineraries", { params }),
  getById: (id) => axiosApi.get(`/itineraries/${id}`),
  create: (data) => axiosApi.post("/itineraries", data),
  update: (id, data) => axiosApi.put(`/itineraries/${id}`, data),
  delete: (id) => axiosApi.delete(`/itineraries/${id}`),
};
export const locationAPI = {
  getAll: (params = {}) => axiosApi.get("/Location", { params }),
  getById: (id) => axiosApi.get(`/Location/${id}`),
  create: (data) => axiosApi.post("/Location", data),
  update: (id, data) => axiosApi.put(`/Location/${id}`, data),
  delete: (id) => axiosApi.delete(`/Location/${id}`),
  getFeatured: (params = {}) => axiosApi.get("/Location/featured", { params }),
  getNearby: (params = {}) => axiosApi.get("/Location/nearby", { params }),
  getReviews: (id, params = {}) => axiosApi.get(`/Location/${id}/reviews`, { params }),
  createReview: (id, data) => axiosApi.post(`/Location/${id}/reviews`, data),
}

// Hàm helper để gọi API
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  let defaultHeaders = {
    'Accept': 'application/json',
  };
  let body = options.body;

  // Nếu body là FormData thì KHÔNG set Content-Type
  if (body instanceof FormData) {
    // Không set Content-Type, để trình duyệt tự động
  } else if (body && typeof body === 'object') {
    defaultHeaders['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const defaultOptions = {
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    },
    ...options,
    body,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Đọc text, chỉ parse JSON nếu có nội dung
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Các phương thức HTTP
export const api = {
  get: (endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return apiCall(url, { method: 'GET' });
  },
  
  post: (endpoint, data = {}) => {
    return apiCall(endpoint, {
      method: 'POST',
      body: data,
    });
  },
  
  put: (endpoint, data = {}) => {
    return apiCall(endpoint, {
      method: 'PUT',
      body: data,
    });
  },
  
  patch: (endpoint, data = {}) => {
    return apiCall(endpoint, {
      method: 'PATCH',
      body: data,
    });
  },
  
  delete: (endpoint) => {
    return apiCall(endpoint, { method: 'DELETE' });
  },
};

export default api; 

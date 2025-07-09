// Cấu hình API cho kết nối với backend Laravel
const API_BASE_URL = 'http://localhost:8000/api';

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
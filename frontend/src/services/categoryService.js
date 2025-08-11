import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const categoryService = {
  // Lấy tất cả categories
  getAllCategories: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/categories`, { params });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách danh mục:', error);
      throw error;
    }
  },

  // Lấy category theo ID
  getCategoryById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết danh mục:', error);
      throw error;
    }
  },

  // Tạo category mới
  createCategory: async (categoryData) => {
    try {
      const response = await axios.post(`${API_URL}/categories`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo danh mục:', error);
      throw error;
    }
  },

  // Cập nhật category
  updateCategory: async (id, categoryData) => {
    try {
      const response = await axios.put(`${API_URL}/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật danh mục:', error);
      throw error;
    }
  },

  // Xóa category
  deleteCategory: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xóa danh mục:', error);
      throw error;
    }
  },

  // Import categories từ Excel
  importCategories: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/categories/import`, formData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi import danh mục:', error);
      throw error;
    }
  },

  // Lấy danh mục với số lượng món ăn
  getCategoriesWithCuisinesCount: async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`, {
        params: {
          with_cuisines_count: true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh mục với số lượng món ăn:', error);
      throw error;
    }
  }
};

export default categoryService; 
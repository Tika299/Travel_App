import api from './api.js';

// Service cho Category API
export const categoryService = {
  // Lấy danh sách tất cả danh mục
  getAllCategories: async (params = {}) => {
    try {
      const response = await api.get('/categories', params);
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Lấy danh mục theo ID
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Tạo danh mục mới
  createCategory: async (categoryData) => {
    try {
      let dataToSend = categoryData;
      let config = {};
      if (categoryData.icon instanceof File) {
        const formData = new FormData();
        formData.append('name', categoryData.name);
        formData.append('type', categoryData.type);
        formData.append('icon', categoryData.icon);
        dataToSend = formData;
        config.headers = { 'Content-Type': 'multipart/form-data' };
      }
      const response = await api.post('/categories', dataToSend, config);
      return response;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Cập nhật danh mục
  updateCategory: async (id, categoryData) => {
    try {
      let dataToSend = categoryData;
      let config = {};
      if (categoryData.icon instanceof File) {
        const formData = new FormData();
        formData.append('name', categoryData.name);
        formData.append('type', categoryData.type);
        formData.append('icon', categoryData.icon);
        dataToSend = formData;
        config.headers = { 'Content-Type': 'multipart/form-data' };
      }
      // Nếu icon là string, không gửi Content-Type multipart
      const response = await api.post(`/categories/${id}?_method=PUT`, dataToSend, config);
      return response;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Xóa danh mục
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Lấy danh mục với số lượng món ăn
  getCategoriesWithCuisinesCount: async () => {
    try {
      const response = await api.get('/categories', {
        with_cuisines_count: true
      });
      return response;
    } catch (error) {
      console.error('Error fetching categories with cuisines count:', error);
      throw error;
    }
  },
};

export default categoryService; 
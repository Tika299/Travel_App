// src/services/ui/Dish/dishService.js
import axios from 'axios';

export const getSuggestedDishes = () => {
  return axios.get('http://localhost:8000/api/dishes/suggested');
};

// src/services/ui/Hotel/hotelService.js
import axios from 'axios';

export const getSuggestedRestaurant = () => {
  return axios.get('http://localhost:8000/api/restaurants/suggested');
};

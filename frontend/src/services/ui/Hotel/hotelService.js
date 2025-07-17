// src/services/ui/Hotel/hotelService.js
import axios from 'axios';

export const getSuggestedHotels = () => {
  return axios.get('http://localhost:8000/api/hotels/suggested');
};

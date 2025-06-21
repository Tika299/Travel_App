
import axios from 'axios';

export const getSuggestedTransportation= () => {
  return axios.get('http://localhost:8000/api/transportations/suggested');
};

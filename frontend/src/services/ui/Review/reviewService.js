
import axios from 'axios';

export const getSuggestedReviews = () => {
  return axios.get('http://localhost:8000/api/reviews/suggested');
};

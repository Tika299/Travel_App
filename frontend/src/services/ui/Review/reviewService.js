import axios from "axios";
const URL_LINK = "http://localhost:8000/api";

export const getReviews = async (page = 1) => {
  const res = await axios.get(`${URL_LINK}/reviews?page=${page}`);
  return res.data;
};

export const createReview = async (formData) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(`${URL_LINK}/reviews`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const uploadReviewImage = async (reviewId, files) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images[]", file);
  });

  const res = await axios.post(
    `${URL_LINK}/reviews/${reviewId}/images`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};

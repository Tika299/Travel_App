import banerImage from "../../assets/images/banner_reviewpage.jpg";
import Header from "../../components/Header";
import CardReview from "../../components/review/CardReview";
import Footer from "../../components/Footer";
import FormReview from "../../components/review/FormReview";
import { useEffect, useState } from "react";
import {
  getReview,
  getReviews,
  updateReview,
  deleteReview,
  getUser,
} from "../../services/ui/Review/reviewService";
import CardReviewSkeleton from "../../components/review/CardReviewSkeleton";
import { Pagination } from "../../components/review/Pagination";

const ReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [user, setUser] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  const fetchUser = async () => {
    try {
      const data = await getUser();
      setUser(data);
    } catch (error) {
      console.log(error);
      setUser(null);
    }
  };
  console.log(user);

  useEffect(() => {
    fetchUser();
  }, []);

  const handleOpenDetail = async (id) => {
    try {
      const data = await getReview(id);
      setSelectedReview(data);
    } catch (err) {
      console.error("Không thể lấy chi tiết review:", err);
    }
  };

  useEffect(() => {
    loadReviews(page);
  }, [page]);

  const loadReviews = async (pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReviews(pageNum);
      setReviews(data.data);
      setLastPage(data.last_page);
    } catch (err) {
      console.error("Lỗi khi load reviews:", err);
      setError("Không thể tải danh sách bài review.");
    } finally {
      setLoading(false);
    }
  };

  const reloadFirstPage = async () => {
    setPage(1);
    await loadReviews(1);
  };

  const handleDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      if (reviews.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (err) {
      console.error("Lỗi khi xóa bài review:", err);
      setError("Không thể xóa bài review.");
    }
  };

  return (
    <>
      <Header />

      {/* Banner */}
      <div className="p-2">
        <div
          className="w-full h-[150px] bg-cover bg-center relative"
          style={{
            backgroundImage: `url(${banerImage})`,
          }}
        >
          <div className="relative z-10 flex flex-col justify-center items-center h-full text-white text-center px-4">
            <h1 className="text-4xl font-bold text-white">Review Du Lịch</h1>
            <p className="mt-2 text-sm italic">
              Chia sẻ những trải nghiệm của bạn tại các địa điểm đã ghé thăm
            </p>
          </div>
        </div>
      </div>

      {/* User Post Review */}
      <FormReview user={user} onSuccess={reloadFirstPage} />

      {/* Loading Skeleton */}
      {loading && (
        <>
          {[...Array(2)].map((_, idx) => (
            <CardReviewSkeleton key={idx} />
          ))}
        </>
      )}
      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div className="flex justify-center items-center my-10">
          <p className="text-red-500 text-lg">Đã xảy ra lỗi: {error}</p>
        </div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <>
          {reviews.map((review) => (
            <CardReview
              key={review.id}
              review={review}
              user={user}
              onDelete={handleDelete}
              onClick={() => handleOpenDetail(review.id)}
            />
          ))}

          <Pagination page={page} setPage={setPage} lastPage={lastPage} />
        </>
      )}

      {/* Không có review */}
      {!loading && !error && reviews.length === 0 && (
        <div className="text-center my-10 text-gray-500 text-lg">
          Chưa có bài review nào được đăng.
        </div>
      )}

      <Footer />
    </>
  );
};

export default ReviewPage;

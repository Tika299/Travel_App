import banerImage from "../../assets/images/banner_reviewpage.jpg";
import Header from "../../components/Header";
import CardReview from "../../components/review/CardReview";
import Footer from "../../components/Footer";
import FormReview from "../../components/review/FormReview";
import { useEffect, useState } from "react";
import { getReviews } from "../../services/ui/Review/reviewService";
import CardReviewSkeleton from "../../components/review/CardReviewSkeleton";

const ReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const user = JSON.parse(localStorage.getItem("user"));

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
            <CardReview key={review.id} review={review} user={user} />
          ))}

          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`px-4 py-2 rounded ${
                page === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              ← Trang trước
            </button>

            <span className="mx-2 text-gray-700">
              Trang {page} / {lastPage}
            </span>

            <button
              disabled={page === lastPage}
              onClick={() => setPage(page + 1)}
              className={`px-4 py-2 rounded ${
                page === lastPage
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Trang sau →
            </button>
          </div>
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

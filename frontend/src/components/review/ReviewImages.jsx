import { useState } from "react";
import { BiSkipNext, BiSkipPrevious } from "react-icons/bi";

const ReviewImages = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative mt-2 w-full h-[460px] overflow-hidden rounded-xl">
      <img
        src={`http://localhost:8000/${images[currentIndex].image_path}`}
        alt={`review-img-${currentIndex}`}
        className="w-full h-full object-cover transition-all duration-300"
      />

      {/* Nút điều hướng */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute top-1/2 left-2 transform -translate-y-1/2  text-white p-2 rounded-full hover:bg-slate-100"
          >
            <BiSkipPrevious className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 right-2 transform -translate-y-1/2  text-white p-2 rounded-full hover:bg-slate-100"
          >
            <BiSkipNext className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Chấm tròn hiển thị vị trí */}
      <div className="absolute bottom-2 w-full flex justify-center space-x-1">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full ${
              idx === currentIndex ? "bg-white" : "bg-gray-400"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};
export default ReviewImages;

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
    <div className="relative my-4 w-full h-[400px] aspect-[1/5] overflow-hidden bg-black">
      {/* Container slide */}
      <div
        className="w-full h-full flex transition-transform duration-500"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            className="min-w-full h-full flex items-center justify-center bg-white"
          >
            <img
              src={`http://localhost:8000${img.image_path}`}
              alt={`review-img-${idx}`}
              className="w-full h-full transition-transform duration-300 object-contain"
            />
          </div>
        ))}
      </div>

      {/* Nút điều hướng */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
          >
            <BiSkipPrevious className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
          >
            <BiSkipNext className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Chấm vị trí */}
      <div className="absolute bottom-3 w-full flex justify-center gap-2">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === currentIndex ? "bg-white" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
export default ReviewImages;

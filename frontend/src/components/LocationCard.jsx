"use client"

import { Star, MapPin, Heart, Navigation} from "lucide-react"
import { useNavigate } from "react-router-dom"
export default function LocationCard({ location, onFavorite, showDistance = false }) {
  const navigate = useNavigate()
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  const displayRating = location.average_rating || location.rating || 0
  const handleViewDetail = () => {
    // Chuyển đến trang detail với ID của location
    navigate(`/location/${location.id}`)
  }
  // const handleCardClick = () => {
  //   // Cho phép click vào toàn bộ card để chuyển trang
  //   navigate(`/location/${location.id}`)
  // }

  return (
    
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full 
    flex flex-col">
  {/* Ảnh */}
  <div className="relative w-full h-48 overflow-hidden">
    <img
      src={"image/"+ location.image || "image/Ho-Hoan-Kiem.jpg"}
      alt={location.name}
      className="w-full h-full object-cover"
    />
    <button
      onClick={() => onFavorite?.(location.id)}
      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
    >
      <Heart className="h-5 w-5 text-gray-600" />
    </button>
    <div className="absolute top-3 left-3">
      <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-sm font-medium">
        {location.category}
      </span>
    </div>
    {showDistance && location.distance && (
      <div className="absolute bottom-3 right-3">
        <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1">
          <Navigation className="h-3 w-3" />
          {location.distance.toFixed(1)}km
        </span>
      </div>
    )}
  </div>

  {/* Nội dung */}
  <div className="flex flex-col justify-between flex-1 p-4">
    <div>
      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{location.name}</h3>
      <div className="flex items-center gap-1 mb-2">
        {renderStars(displayRating)}
        <span className="text-sm text-gray-600 ml-1">({location.reviews_count || 0})</span>
      </div>
      <div className="flex items-center text-gray-600 mb-2">
        <MapPin className="h-4 w-4 mr-1" />
        <span className="text-sm line-clamp-1">{location.address}</span>
      </div>
      <p className="text-gray-700 text-sm line-clamp-3">{location.description}</p>
    </div>

    {/* Phần dưới cùng */}
    <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
      <div className="text-sm">
        {location.has_fee ? (
          <span className="text-orange-600 font-medium">Có phí</span>
        ) : (
          <span className="text-green-600 font-medium">Miễn phí</span>
        )}
      </div>
      <button
            onClick={(e) => {
              e.stopPropagation() // Ngăn không cho click bubble up
              handleViewDetail()
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Xem chi tiết
          </button>
    </div>
  </div>
</div>

  )
}

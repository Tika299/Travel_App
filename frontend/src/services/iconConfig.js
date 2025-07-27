import { FaWifi, FaSwimmingPool, FaParking, FaUtensils, FaCocktail, FaSpa, FaDumbbell, FaSortAmountUp } from 'react-icons/fa';
import { MdAcUnit, MdRoomService } from 'react-icons/md';

// Ánh xạ tên tiện ích với component biểu tượng từ react-icons
const iconMap = {
  'Wifi miễn phí': FaWifi,
  'Điều hòa nhiệt độ': MdAcUnit,
  'Hồ bơi': FaSwimmingPool,
  'Bãi đậu xe': FaParking,
  'Nhà hàng': FaUtensils,
  'Quầy bar': FaCocktail,
  'Spa': FaSpa,
  'Phòng gym': FaDumbbell,
  'Thang máy': FaSortAmountUp,
  'Dịch vụ phòng': MdRoomService,
};

// Hàm để lấy component biểu tượng dựa trên tên tiện ích
export const getAmenityIcon = (amenityName) => {
  return iconMap[amenityName] || null; // Trả về null nếu không tìm thấy biểu tượng
};
import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FiGift, FiSun, FiDollarSign, FiFilter, FiMapPin, FiCalendar, FiCloud, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getAllCheckinPlaces } from '../../../services/ui/CheckinPlace/checkinPlaceService';
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";

// Danh sách địa điểm mẫu để gợi ý
const locationSuggestions = [
  { name: 'Hồ Chí Minh', detail: 'Ho Chi Minh City, Vietnam' },
  { name: 'Hà Nội', detail: 'Hanoi, Vietnam' },
  { name: 'Đà Nẵng', detail: 'Da Nang, Vietnam' },
  { name: 'Nha Trang', detail: 'Khanh Hoa, Vietnam' },
  { name: 'Hạ Long', detail: 'Quang Ninh, Vietnam' },
  { name: 'Phú Quốc', detail: 'Kien Giang, Vietnam' },
  { name: 'Sa Pa', detail: 'Lao Cai, Vietnam' },
  { name: 'Hội An', detail: 'Quang Nam, Vietnam' },
  { name: 'Huế', detail: 'Thua Thien Hue, Vietnam' },
  { name: 'Vũng Tàu', detail: 'Ba Ria - Vung Tau, Vietnam' },
  { name: 'Cần Thơ', detail: 'Can Tho, Vietnam' },
  { name: 'Đà Lạt', detail: 'Lam Dong, Vietnam' },
];

export default function Sidebar({ onCreateEvent, onAIGenerateEvents, onAILoadingChange, onAIConfirmModal, onShowToast }) {
  const [date, setDate] = useState(new Date());
  const [address, setAddress] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const debounceRef = useRef();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [suggestWeather, setSuggestWeather] = useState(false);
  const [allPlaces, setAllPlaces] = useState([]);
  const [suggestBudget, setSuggestBudget] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [events, setEvents] = useState([]); // New: store created events
  const [showToast, setShowToast] = useState(false);
  const [toastEvent, setToastEvent] = useState(null);
  const [toastProgress, setToastProgress] = useState(0);
  const toastTimerRef = useRef();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEventData, setAddEventData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    location: '',
    description: ''
  });
  const calendarRef = useRef();
  const [isAILoading, setIsAILoading] = useState(false);

  // Update parent's AI loading state
  const updateAILoading = (loading) => {
    setIsAILoading(loading);
    if (onAILoadingChange) {
      onAILoadingChange(loading);
    }
  };



  const showPopupMessage = (msg, type = 'success') => {
    if (onShowToast) {
      onShowToast(msg, type);
    } else {
      // Fallback to old method if prop not provided
      setMessage(msg);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    }
  };

  // Fetch toàn bộ địa điểm, khách sạn, nhà hàng 1 lần khi mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingLocations(true);
        
        // Lấy địa điểm check-in
        const res = await getAllCheckinPlaces();
        const places = res.data?.data || [];
        
        // Lấy khách sạn (nếu có API)
        let hotels = [];
        try {
          const hotelRes = await fetch('http://localhost:8000/api/hotels');
          if (hotelRes.ok) {
            const hotelData = await hotelRes.json();
            hotels = hotelData.data || [];
          }
        } catch (e) {
          console.log('Không thể lấy dữ liệu khách sạn:', e);
        }
        
        // Lấy nhà hàng (nếu có API)
        let restaurants = [];
        try {
          const restaurantRes = await fetch('http://localhost:8000/api/Restaurant');
          if (restaurantRes.ok) {
            const restaurantData = await restaurantRes.json();
            restaurants = restaurantData.data || [];
          }
        } catch (e) {
          console.log('Không thể lấy dữ liệu nhà hàng:', e);
        }
        
        // Kết hợp tất cả dữ liệu
        const allData = [
          ...places.map(p => ({ ...p, type: 'place' })),
          ...hotels.map(h => ({ ...h, type: 'hotel' })),
          ...restaurants.map(r => ({ ...r, type: 'restaurant' }))
        ];
        
        if (mounted) setAllPlaces(allData);
        console.log('Loaded data:', { places: places.length, hotels: hotels.length, restaurants: restaurants.length });
      } catch (e) {
        if (mounted) setAllPlaces([]);
      } finally {
        if (mounted) setLoadingLocations(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Google Places Autocomplete setup
  const {
    ready,
    value: placesValue,
    setValue: setPlacesValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      // Optionally restrict to Vietnam
      componentRestrictions: { country: "vn" },
    },
    debounce: 300,
    googleMapsApiKey: "AIzaSyAs3hEfbNoQPBdI2q8Tvi5QlhetKEoKa_o",
  });

  useEffect(() => {
    if (!ready) {
      console.log('Google Places API chưa sẵn sàng');
    } else {
      console.log('Google Places API đã sẵn sàng');
    }
  }, [ready]);

  // Khi chọn địa điểm từ Google
  const handleSelectPlace = async (description) => {
    try {
      setPlacesValue(description, false);
      setAddress(description);
      clearSuggestions();
      // Nếu muốn lấy lat/lng:
      // const results = await getGeocode({ address: description });
      // const { lat, lng } = await getLatLng(results[0]);
      // setLatLng({ lat, lng });
    } catch (error) {
      console.error('Lỗi khi chọn địa điểm:', error);
              showPopupMessage('Có lỗi xảy ra khi chọn địa điểm. Vui lòng thử lại.', 'error');
    }
  };

  // Khi chọn địa điểm từ dropdown
  const handleSelectLocation = (loc) => {
    setAddress(loc.name);
    setShowDropdown(false);
  };

  // Hàm reset form
  const resetForm = () => {
    setAddress('');
    setStartDate(null);
    setEndDate(null);
    const budgetInput = document.getElementById('sidebar-budget');
    if (budgetInput) budgetInput.value = '';
  };

  const handleSuggestWeatherChange = (e) => {
    if (e.target.checked && (!startDate || !endDate)) {
      showPopupMessage('Vui lòng chọn ngày đi và ngày về trước khi lọc theo thời tiết!', 'error');
      return;
    }
    setSuggestWeather(e.target.checked);
  };

  const handleSuggestBudgetChange = (e) => {
    if (e.target.checked) {
      const budgetInput = document.getElementById('sidebar-budget');
      let budget = 0;
      if (budgetInput && budgetInput.value) {
        budget = parseInt(budgetInput.value.replace(/\D/g, '')) || 0;
      }
      if (!budget) {
        showPopupMessage('Vui lòng nhập ngân sách trước khi lọc theo chi phí!', 'error');
        return;
      }
    }
    setSuggestBudget(e.target.checked);
  };

  // Hàm gợi ý AI dựa trên dữ liệu database thực tế
  const handleAIGenerateSchedule = async () => {
    if (!address || !startDate || !endDate) {
      showPopupMessage('Vui lòng chọn đầy đủ địa điểm, ngày đi, ngày về!', 'error');
      return;
    }
    
    updateAILoading(true);
    
    try {
      // Lấy ngân sách
      const budgetInput = document.getElementById('sidebar-budget');
      let budget = 0;
      if (budgetInput && budgetInput.value) {
        budget = parseInt(budgetInput.value.replace(/\D/g, '')) || 0;
      }

      // Tính số ngày du lịch
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      // Tìm địa điểm phù hợp từ database
      const selectedPlace = allPlaces.find(place => 
        place.name.toLowerCase().includes(address.toLowerCase()) ||
        place.address.toLowerCase().includes(address.toLowerCase())
      );

      // Sử dụng ID hợp lệ từ database hoặc lấy ID đầu tiên có sẵn
      const checkin_place_id = selectedPlace ? selectedPlace.id : (allPlaces.length > 0 ? allPlaces[0].id : 44);
      const user_id = 1; // TODO: lấy đúng id user đăng nhập
      const participants = 1;
      const name = `Lịch trình ${daysDiff} ngày: ${address}`;
      
      // Lấy dữ liệu từ database
      let databaseInfo = '';
      
      // Thêm thông tin về địa điểm chính
      if (selectedPlace) {
        databaseInfo += `Địa điểm chính: ${selectedPlace.name} - ${selectedPlace.description || 'Không có mô tả'}`;
        if (selectedPlace.rating) {
          databaseInfo += ` (Đánh giá: ${selectedPlace.rating}/5)`;
        }
        if (selectedPlace.price) {
          databaseInfo += ` (Chi phí: ${selectedPlace.price})`;
        }
        databaseInfo += '. ';
      }

      // Lọc địa điểm theo địa chỉ nhập
      const filteredPlaces = allPlaces.filter(place => {
        const searchTerm = address.toLowerCase();
        return place.name.toLowerCase().includes(searchTerm) ||
               place.address.toLowerCase().includes(searchTerm) ||
               (place.description && place.description.toLowerCase().includes(searchTerm));
      });

      // Lấy các địa điểm nổi bật trong khu vực (rating >= 4.0)
      const topPlaces = filteredPlaces.filter(place => 
        place.rating >= 4.0 && place.id !== checkin_place_id
      ).slice(0, 10);

      if (topPlaces.length > 0) {
        databaseInfo += `Các địa điểm nổi bật trong khu vực: ${topPlaces.map(p => `${p.name} (${p.rating}/5)`).join(', ')}. `;
      }

      // Lấy các địa điểm miễn phí trong khu vực
      const freePlaces = filteredPlaces.filter(place => 
        place.is_free === true
      ).slice(0, 5);

      if (freePlaces.length > 0) {
        databaseInfo += `Địa điểm miễn phí trong khu vực: ${freePlaces.map(p => p.name).join(', ')}. `;
      }

      // Lấy khách sạn nổi bật trong khu vực
      const topHotels = filteredPlaces.filter(place => 
        place.type === 'hotel' && place.rating >= 4.0
      ).slice(0, 5);

      if (topHotels.length > 0) {
        databaseInfo += `Khách sạn nổi bật trong khu vực: ${topHotels.map(h => `${h.name} (${h.rating}/5)`).join(', ')}. `;
      }

      // Lấy nhà hàng nổi bật trong khu vực
      const topRestaurants = filteredPlaces.filter(place => 
        place.type === 'restaurant' && place.rating >= 4.0
      ).slice(0, 5);

      if (topRestaurants.length > 0) {
        databaseInfo += `Nhà hàng nổi bật trong khu vực: ${topRestaurants.map(r => `${r.name} (${r.rating}/5)`).join(', ')}. `;
      }

      // Tạo prompt thông minh dựa trên dữ liệu database thực tế
      let prompt = `Tôi sẽ đi du lịch ${address} trong ${daysDiff} ngày từ ${startDate?.toISOString?.().slice(0,10) || startDate} đến ${endDate?.toISOString?.().slice(0,10) || endDate}. `;
      prompt += `Ngân sách: ${budget.toLocaleString('vi-VN')} VND. `;
      prompt += `Dữ liệu từ database: ${databaseInfo}`;
      
      // Xác định loại lọc dựa trên checkbox
      let filterType = 'general';
      
      if (suggestBudget) {
        filterType = 'budget_only';
        prompt += ` QUAN TRỌNG: Hãy tạo lịch trình ${daysDiff} ngày tiết kiệm chi phí với ngân sách ${budget.toLocaleString('vi-VN')} VND, ưu tiên các địa điểm miễn phí và ẩm thực giá rẻ từ database.`;
      } else {
        filterType = 'general';
        prompt += ` Hãy tạo lịch trình ${daysDiff} ngày tổng quát với đầy đủ thông tin, sử dụng các địa điểm thực tế từ database.`;
      }
      
      prompt += ` Tạo ${daysDiff} sự kiện, mỗi ngày 2-3 hoạt động. SỬ DỤNG ĐỊA ĐIỂM CỤ THỂ TỪ DATABASE đã cung cấp ở trên, KHÔNG tạo địa điểm chung chung như "nhà hàng địa phương", "chợ địa phương". Trả về JSON array các event với trường: title, start, end, location, description, cost, weather.`;
      
      // Gọi API AI
      console.log('Sending request to AI API with data:', {
        prompt,
        name,
        start_date: startDate.toISOString().slice(0,10),
        end_date: endDate.toISOString().slice(0,10),
        checkin_place_id,
        participants,
        user_id,
        budget,
        filterType
      });

      const openaiRes = await fetch('http://localhost:8000/api/ai-suggest-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          name, 
          start_date: startDate.toISOString().slice(0,10), 
          end_date: endDate.toISOString().slice(0,10), 
          checkin_place_id, 
          participants, 
          user_id, 
          budget, 
          filterType,
          location: address // Thêm địa điểm để geocoding
        }),
      });

      if (!openaiRes.ok) {
        const errText = await openaiRes.text();
        console.error('AI API Error:', errText);
        
        // Nếu AI không hoạt động, sử dụng dữ liệu mẫu
        const isBackendConnected = await testBackendConnection();
        if (isBackendConnected) {
          console.log('Using sample data due to AI API error');
          const sampleEvents = createSampleEvents();
          if (onAIConfirmModal) {
            onAIConfirmModal(true, sampleEvents);
          }
          return;
        } else {
          throw new Error('Không thể kết nối đến backend. Vui lòng kiểm tra server!');
        }
      }

      let aiResult;
      try {
        aiResult = await openaiRes.json();
      } catch (e) {
        console.error('JSON parse error:', e);
        // Sử dụng dữ liệu mẫu nếu không parse được JSON
        const sampleEvents = createSampleEvents();
        if (onAIConfirmModal) {
          onAIConfirmModal(true, sampleEvents);
        }
        return;
      }
      
      // Hiển thị modal xác nhận với người dùng
      console.log('AI Result:', aiResult); // Debug log
      
      if (aiResult && Array.isArray(aiResult.ai_events) && aiResult.ai_events.length > 0) {
        if (onAIConfirmModal) {
          onAIConfirmModal(true, aiResult.ai_events);
        }
        

        
        // Hiển thị thông tin địa điểm đã lọc
        if (aiResult.filtered_places) {
          console.log('Filtered places:', aiResult.filtered_places);
        }
      } else if (aiResult && Array.isArray(aiResult.ai_events) && aiResult.ai_events.length === 0) {
        // Nếu AI trả về mảng rỗng, sử dụng dữ liệu mẫu
        console.log('AI returned empty array, using sample data');
        const sampleEvents = createSampleEvents();
        if (onAIConfirmModal) {
          onAIConfirmModal(true, sampleEvents);
        }
      } else if (onAIGenerateEvents) {
        onAIGenerateEvents(aiResult);
        showPopupMessage('Đã thêm thành công các sự kiện AI vào lịch!');
      } else {
        // Fallback: sử dụng dữ liệu mẫu
        console.log('Using sample data as fallback');
        const sampleEvents = createSampleEvents();
        if (onAIConfirmModal) {
          onAIConfirmModal(true, sampleEvents);
        }
      }
    } catch (err) {
              showPopupMessage(err.message || 'Đã xảy ra lỗi khi gợi ý lịch trình AI!', 'error');
    } finally {
      updateAILoading(false);
    }
  };

  // Hàm test kết nối backend và tạo dữ liệu mẫu
  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/checkin-places');
      console.log('Backend connection test:', response.ok);
      return response.ok;
    } catch (error) {
      console.error('Backend connection failed:', error);
      return false;
    }
  };

  // Hàm tạo dữ liệu mẫu dựa trên database thực tế
  const createSampleEvents = () => {
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const events = [];
    
    // Tìm địa điểm phù hợp từ database
    const selectedPlace = allPlaces.find(place => 
      place.name.toLowerCase().includes(address.toLowerCase()) ||
      place.address.toLowerCase().includes(address.toLowerCase())
    );
    
    // Lọc địa điểm theo địa chỉ nhập
    const filteredPlaces = allPlaces.filter(place => {
      const searchTerm = address.toLowerCase();
      return place.name.toLowerCase().includes(searchTerm) ||
             place.address.toLowerCase().includes(searchTerm) ||
             (place.description && place.description.toLowerCase().includes(searchTerm));
    });
    
    // Lấy các địa điểm nổi bật trong khu vực từ database
    const topPlaces = filteredPlaces.filter(place => place.rating >= 4.0).slice(0, 10);
    const freePlaces = filteredPlaces.filter(place => place.is_free === true).slice(0, 5);
    
    // Tạo lịch trình cho từng ngày
    for (let day = 0; day < daysDiff; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + day);
      const dateStr = currentDate.toISOString().slice(0, 10);
      
      // Ngày 1: Khám phá chính
      if (day === 0) {
        events.push({
          title: selectedPlace ? `Tham quan ${selectedPlace.name}` : "Khám phá địa điểm chính",
          start: `${dateStr}T08:00:00`,
          end: `${dateStr}T12:00:00`,
          location: selectedPlace ? selectedPlace.name : address,
          description: selectedPlace ? selectedPlace.description : "Khám phá địa điểm du lịch chính",
          cost: selectedPlace && selectedPlace.price ? `${selectedPlace.price.toLocaleString('vi-VN')} VND` : "Miễn phí",
          weather: "Nắng đẹp, 28°C"
        });
        
        // Tìm nhà hàng gần đó
        const nearbyRestaurants = filteredPlaces.filter(p => p.type === 'restaurant').slice(0, 3);
        const restaurant = nearbyRestaurants[0] || null;
        
        if (restaurant) {
          events.push({
            title: `Ăn trưa tại ${restaurant.name}`,
            start: `${dateStr}T12:30:00`,
            end: `${dateStr}T14:00:00`,
            location: restaurant.name,
            description: restaurant.description || "Thưởng thức ẩm thực đặc trưng của vùng",
            cost: restaurant.price_range === 'low' ? "80.000 VND" : "150.000 VND",
            weather: "Nắng đẹp, 28°C"
          });
        }
      }
      
      // Ngày 2-6: Khám phá các địa điểm nổi bật
      else if (day < 6 && topPlaces.length > 0) {
        const placeIndex = (day - 1) % topPlaces.length;
        const place = topPlaces[placeIndex];
        
        events.push({
          title: `Tham quan ${place.name}`,
          start: `${dateStr}T09:00:00`,
          end: `${dateStr}T11:30:00`,
          location: place.name,
          description: place.description || "Khám phá địa điểm nổi bật",
          cost: place.price ? `${place.price.toLocaleString('vi-VN')} VND` : "Miễn phí",
          weather: "Nắng đẹp, 28°C"
        });
        
        // Tìm nhà hàng gần đó
        const nearbyRestaurants = filteredPlaces.filter(p => p.type === 'restaurant').slice(0, 3);
        const restaurant = nearbyRestaurants[Math.floor(Math.random() * nearbyRestaurants.length)] || null;
        
        if (restaurant) {
          events.push({
            title: `Ăn trưa tại ${restaurant.name}`,
            start: `${dateStr}T12:00:00`,
            end: `${dateStr}T14:00:00`,
            location: restaurant.name,
            description: restaurant.description || "Thưởng thức bữa trưa và nghỉ ngơi",
            cost: restaurant.price_range === 'low' ? "80.000 VND" : "120.000 VND",
            weather: "Nắng đẹp, 28°C"
          });
        }
      }
      
      // Ngày cuối: Tổng kết
      else if (day === daysDiff - 1) {
        // Tìm chợ hoặc trung tâm mua sắm
        const shoppingPlaces = filteredPlaces.filter(p => 
          p.name.toLowerCase().includes('chợ') || 
          p.name.toLowerCase().includes('mall') ||
          p.name.toLowerCase().includes('center')
        );
        const shoppingPlace = shoppingPlaces[0] || null;
        
        if (shoppingPlace) {
          events.push({
            title: `Mua sắm tại ${shoppingPlace.name}`,
            start: `${dateStr}T09:00:00`,
            end: `${dateStr}T11:00:00`,
            location: shoppingPlace.name,
            description: shoppingPlace.description || "Mua sắm quà lưu niệm và đặc sản địa phương",
            cost: shoppingPlace.price ? `${shoppingPlace.price.toLocaleString('vi-VN')} VND` : "Miễn phí",
            weather: "Nắng đẹp, 28°C"
          });
        }
        
        // Tìm nhà hàng cao cấp
        const highEndRestaurants = filteredPlaces.filter(p => 
          p.type === 'restaurant' && p.price_range === 'high'
        );
        const highEndRestaurant = highEndRestaurants[0] || null;
        
        if (highEndRestaurant) {
          events.push({
            title: `Bữa tối tại ${highEndRestaurant.name}`,
            start: `${dateStr}T18:00:00`,
            end: `${dateStr}T20:00:00`,
            location: highEndRestaurant.name,
            description: highEndRestaurant.description || "Thưởng thức bữa tối đặc biệt cuối chuyến đi",
            cost: "300.000 VND",
            weather: "Mát mẻ, 25°C"
          });
        }
      }
      
      // Các ngày khác: Hoạt động tự do hoặc địa điểm cụ thể
      else {
        // Tìm địa điểm miễn phí hoặc có rating cao
        const availablePlaces = filteredPlaces.filter(p => 
          p.is_free === true || p.rating >= 4.0
        ).slice(0, 3);
        
        if (availablePlaces.length > 0) {
          const place = availablePlaces[Math.floor(Math.random() * availablePlaces.length)];
          events.push({
            title: `Tham quan ${place.name}`,
            start: `${dateStr}T10:00:00`,
            end: `${dateStr}T17:00:00`,
            location: place.name,
            description: place.description || "Khám phá địa điểm thú vị",
            cost: place.price ? `${place.price.toLocaleString('vi-VN')} VND` : "Miễn phí",
            weather: "Nắng đẹp, 28°C"
          });
        }
      }
    }
    
    return events;
  };

  // Toast tự động ẩn sau 4s
  useEffect(() => {
    let timer;
    if (showToast) {
      timer = setTimeout(() => setShowToast(false), 4000);
    }
    return () => clearTimeout(timer);
  }, [showToast]);

  return (
    <aside className="relative w-full md:w-[260px] min-w-[200px] max-w-[280px] h-full shadow-xl p-4 pb-10 flex flex-col custom-scrollbar overflow-visible backdrop-blur-sm">
      {/* Nền trắng đục kéo dài với hiệu ứng glass */}
      <div className="absolute inset-0 w-full h-full bg-white/95 backdrop-blur-sm z-0 border border-white/20"></div>
      <div className="relative z-10 flex flex-col flex-1">
        {/* Mini Calendar */}
        <div className="w-full min-w-[200px] max-w-[280px] mx-auto flex justify-center">
          <Calendar
            onChange={setDate}
            value={date}
            locale="vi-VN"
            className="border-none rounded-xl"
            formatMonthYear={(_, date) => `Tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`}
            prev2Label={null}
            next2Label={null}
            formatShortWeekday={(locale, date) => {
              const day = date.getDay();
              if (day === 0) return "CN";
              return `T${day + 1}`;
            }}
            tileClassName={({ date, view, activeStartDate }) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isOtherMonth = date.getMonth() !== activeStartDate.getMonth();
              let classes = "flex items-center justify-center w-8 h-8 aspect-square rounded-full text-sm";
              if (isToday) classes += " bg-blue-500 text-white";
              if (isOtherMonth) classes += " text-gray-300";
              return classes;
            }}
            dayHeaderContent={info => {
              const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
              return (
                <span className="uppercase text-xs font-normal text-gray-500">{days[info.date.getDay()]}</span>
              );
            }}
          />
        </div>

        {/* Hoạt động nổi bật */}
        <div>
          <div className="font-semibold mb-1">Hoạt động nổi bật</div>
          <div className="flex flex-col items-center text-gray-500">
            <FiGift className="text-3xl mb-2" />
            <span>Không có sự kiện nổi bật</span>
          </div>
        </div>

        {/* Lên kế hoạch */}
        <div>
          <div className="font-semibold mb-1">Lên kế hoạch chuyến đi</div>
          <form className="flex flex-col gap-2" onSubmit={e => { e.preventDefault(); }}>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="sidebar-address">Địa chỉ</label>
              <div className="relative">
                <input
                  id="sidebar-address"
                  type="text"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full pr-8 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                  placeholder="Nhập địa điểm (Google Maps)"
                  value={placesValue}
                  onChange={e => {
                    setPlacesValue(e.target.value);
                    setAddress(e.target.value);
                  }}
                  autoComplete="off"
                  disabled={!ready}
                />
                <FiMapPin className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                {status === "OK" && data.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 max-h-40 overflow-y-auto">
                    {data.map(({ place_id, description }, idx) => (
                      <div
                        key={place_id}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                        onMouseDown={() => handleSelectPlace(description)}
                      >
                        {description}
                      </div>
                    ))}
                  </div>
                )}
                {status === "ZERO_RESULTS" && placesValue.length > 2 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 p-2 text-sm text-gray-500">
                    Không tìm thấy địa điểm phù hợp
                  </div>
                )}
                {!ready && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 p-2 text-sm text-gray-500">
                    Đang tải Google Maps...
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="sidebar-start-date">Ngày đi</label>
                <div className="relative">
                  <DatePicker
                    id="sidebar-start-date"
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                    className="border border-gray-300 rounded-lg px-2 py-1.5 w-full text-xs text-left pr-6 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                    calendarClassName="rounded-xl shadow-lg border border-gray-200"
                    popperPlacement="bottom"
                    maxDate={endDate}
                  />
                  <FiCalendar className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
                </div>
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="sidebar-end-date">Ngày về</label>
                <div className="relative">
                  <DatePicker
                    id="sidebar-end-date"
                    selected={endDate}
                    onChange={date => setEndDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                    className="border border-gray-300 rounded-lg px-2 py-1.5 w-full text-xs text-left pr-6 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                    calendarClassName="rounded-xl shadow-lg border border-gray-200"
                    popperPlacement="bottom"
                    minDate={startDate}
                  />
                  <FiCalendar className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="sidebar-budget">Ngân sách (VND)</label>
              <input
                id="sidebar-budget"
                type="text"
                placeholder="30.000.000"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
              />
            </div>
            <button
              type="button"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg py-3 mt-2 font-semibold hover:from-blue-600 hover:to-purple-700 shadow-lg transition-all duration-300 transform hover:scale-105"
              onClick={() => {
                onCreateEvent({
                  location: address,
                  startDate: startDate ? startDate.toISOString().slice(0, 10) : '',
                  endDate: endDate ? endDate.toISOString().slice(0, 10) : '',
                });
              }}
            >
              Tạo lịch trình
            </button>
          </form>
        </div>



        {/* Gợi ý thông minh */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg text-yellow-400"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#facc15" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="5" stroke="#facc15" strokeWidth="2"/></svg></span>
            <span className="text-base font-bold text-gray-700">Thêm gợi ý thông minh</span>
          </div>
          <div className="flex flex-col gap-4">
            {/* Card: Theo thời tiết */}
            <label className="relative flex items-center p-3 rounded-lg cursor-pointer transition bg-gradient-to-r from-pink-300 to-pink-400 shadow-md hover:from-pink-400 hover:to-pink-500">
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2">
                  <FiCloud className="text-white text-xl drop-shadow" />
                  <span className="text-base font-bold text-white">Theo thời tiết</span>
                  <input type="checkbox" checked={suggestWeather} onChange={handleSuggestWeatherChange} className="ml-auto w-4 h-4 accent-pink-500" />
                </div>
                <span className="text-white text-xs opacity-90 mt-1">Tạo gợi ý hoạt động phù hợp cho thời tiết hôm nay</span>
              </div>
            </label>
            {/* Card: Tối ưu ngân sách */}
            <label className="relative flex items-center p-3 rounded-lg cursor-pointer transition bg-gradient-to-r from-blue-400 to-blue-500 shadow-md hover:from-blue-500 hover:to-blue-600">
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2">
                  <FiDollarSign className="text-white text-xl drop-shadow" />
                  <span className="text-base font-bold text-white">Tối ưu ngân sách</span>
                  <input type="checkbox" checked={suggestBudget} onChange={handleSuggestBudgetChange} className="ml-auto w-4 h-4 accent-blue-500" />
                </div>
                <span className="text-white text-xs opacity-90 mt-1">Tạo gợi ý hoạt động tiết kiệm chi phí</span>
              </div>
            </label>
          </div>
        </div>

        {/* Nút Gợi ý lịch trình AI */}
        <div className="mt-auto">
          <button 
            className={`rounded-xl py-3 font-semibold flex items-center justify-center gap-2 w-full mt-4 shadow-lg transition-all duration-300 transform hover:scale-105 ${
              isAILoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            } text-white`}
            onClick={handleAIGenerateSchedule}
            disabled={isAILoading}
          >
            {isAILoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang xử lý AI...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                Gợi ý lịch trình AI
              </>
            )}
          </button>
        </div>


        

        

      </div>

      {/* Modal thêm lịch trình */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-600"
              onClick={() => setShowAddModal(false)}
            >
              <FiX />
            </button>
            <div className="text-xl font-bold mb-4 text-center">Thêm lịch trình mới</div>
            <div className="flex flex-col gap-3">
              <input
                className="border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:border-blue-400"
                placeholder="Tiêu đề lịch trình *"
                value={addEventData.title}
                onChange={e => setAddEventData({ ...addEventData, title: e.target.value })}
                autoFocus
              />
              <div className="flex gap-2 items-center">
                <label className="text-sm text-gray-600">Ngày đi:</label>
                <div className="relative flex items-center">
                  <DatePicker
                    selected={addEventData.startDate ? new Date(addEventData.startDate) : null}
                    onChange={date => setAddEventData({ ...addEventData, startDate: date.toISOString().slice(0, 10) })}
                    dateFormat="dd/MM/yyyy"
                    className="border border-gray-300 rounded px-2 py-0.5 text-sm w-28 h-8 text-center pr-7 focus:outline-none"
                    calendarClassName="rounded-xl shadow-lg border border-gray-200"
                    popperPlacement="bottom"
                  />
                  <FiCalendar className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-sm text-gray-600">Ngày về:</label>
                <div className="relative flex items-center">
                  <DatePicker
                    selected={addEventData.endDate ? new Date(addEventData.endDate) : null}
                    onChange={date => setAddEventData({ ...addEventData, endDate: date.toISOString().slice(0, 10) })}
                    dateFormat="dd/MM/yyyy"
                    className="border border-gray-300 rounded px-2 py-0.5 text-sm w-28 h-8 text-center pr-7 focus:outline-none"
                    calendarClassName="rounded-xl shadow-lg border border-gray-200"
                    popperPlacement="bottom"
                  />
                  <FiCalendar className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <input
                className="border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:border-blue-400"
                placeholder="Địa điểm"
                value={addEventData.location}
                onChange={e => setAddEventData({ ...addEventData, location: e.target.value })}
              />
              <textarea
                className="border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:border-blue-400"
                placeholder="Mô tả"
                value={addEventData.description}
                onChange={e => setAddEventData({ ...addEventData, description: e.target.value })}
                rows={2}
              />
              <div className="flex gap-2 justify-end mt-2">
                <button
                  className="px-4 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
                <button
                  className="px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                  onClick={() => {
                    if (!addEventData.title.trim()) return;
                    if (onCreateEvent) onCreateEvent(addEventData);
                    setShowAddModal(false);
                    setShowToast(true);
                    setToastEvent(addEventData);
                    setToastProgress(0);
                    // Reset form
                    setAddEventData({ title: '', startDate: '', endDate: '', location: '', description: '' });
                  }}
                  disabled={!addEventData.title.trim()}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {showToast && toastEvent && (
        <div className="fixed bottom-8 right-8 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fadeIn">
          <FiCheckCircle className="text-2xl text-white drop-shadow" />
          <div>
            <div className="font-bold">Tạo lịch trình thành công!</div>
            <div className="text-sm">{toastEvent.title}</div>
          </div>
        </div>
      )}
    </aside>
  );
} 
import React from 'react';
import { FiCloud, FiSun, FiCloudRain, FiCloudSnow, FiWind, FiThermometer } from 'react-icons/fi';

const WeatherInfo = ({ weatherData, location }) => {
  if (!weatherData || weatherData.length === 0) {
    return null;
  }

  const getWeatherIcon = (main) => {
    switch (main.toLowerCase()) {
      case 'clear':
        return <FiSun className="text-yellow-500" />;
      case 'clouds':
        return <FiCloud className="text-gray-500" />;
      case 'rain':
      case 'drizzle':
        return <FiCloudRain className="text-blue-500" />;
      case 'snow':
        return <FiCloudSnow className="text-blue-300" />;
      default:
        return <FiCloud className="text-gray-400" />;
    }
  };

  const getWeatherAdvice = (weather) => {
    const main = weather.main.toLowerCase();
    const temp = weather.temperature;
    
    if (main.includes('rain') || main.includes('drizzle')) {
      return 'Nên chọn hoạt động trong nhà';
    } else if (temp > 30) {
      return 'Nên chọn hoạt động có điều hòa';
    } else if (temp < 15) {
      return 'Nên mặc ấm khi ra ngoài';
    } else {
      return 'Thời tiết thuận lợi cho hoạt động ngoài trời';
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <FiThermometer className="text-blue-600" />
        <h3 className="font-semibold text-gray-800">
          Thông tin thời tiết - {location}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {weatherData.map((weather, index) => (
          <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">
                {new Date(weather.date).toLocaleDateString('vi-VN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              {getWeatherIcon(weather.main)}
            </div>
            
            <div className="text-center mb-2">
              <div className="text-2xl font-bold text-gray-800">
                {Math.round(weather.temperature)}°C
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {weather.description}
              </div>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-1">
                <FiWind className="text-gray-400" />
                <span>Gió: {weather.wind_speed} m/s</span>
              </div>
              <div className="flex items-center gap-1">
                <FiCloud className="text-gray-400" />
                <span>Độ ẩm: {weather.humidity}%</span>
              </div>
            </div>
            
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
              💡 {getWeatherAdvice(weather)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-600">
        <p>💡 <strong>Gợi ý:</strong> Dựa trên thông tin thời tiết, AI sẽ tạo lịch trình phù hợp với điều kiện thời tiết từng ngày.</p>
      </div>
    </div>
  );
};

export default WeatherInfo; 
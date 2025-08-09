import React, { useState } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";

export default function GooglePlacesTest() {
  const [selectedPlace, setSelectedPlace] = useState('');
  const [coordinates, setCoordinates] = useState(null);

  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "vn" },
    },
    debounce: 300,
    googleMapsApiKey: "AIzaSyAs3hEfbNoQPBdI2q8Tvi5QlhetKEoKa_o",
  });

  const handleSelect = async (description) => {
    try {
      setValue(description, false);
      setSelectedPlace(description);
      clearSuggestions();

      // Lấy tọa độ
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      setCoordinates({ lat, lng });
      
      console.log('Đã chọn:', description);
      console.log('Tọa độ:', { lat, lng });
    } catch (error) {
      console.error('Lỗi khi chọn địa điểm:', error);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Test Google Places API</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Trạng thái API:</label>
        <div className={`px-3 py-2 rounded ${ready ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {ready ? '✅ Sẵn sàng' : '⏳ Đang tải...'}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Tìm kiếm địa điểm:</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          placeholder={ready ? "Nhập tên địa điểm..." : "Đang tải Google Maps..."}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {status === "OK" && data.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Gợi ý:</label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
            {data.map(({ place_id, description }) => (
              <div
                key={place_id}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm border-b border-gray-100"
                onClick={() => handleSelect(description)}
              >
                {description}
              </div>
            ))}
          </div>
        </div>
      )}

      {status === "ZERO_RESULTS" && value.length > 2 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
          Không tìm thấy địa điểm phù hợp
        </div>
      )}

      {selectedPlace && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Địa điểm đã chọn:</label>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="font-medium">{selectedPlace}</div>
            {coordinates && (
              <div className="text-sm text-gray-600 mt-1">
                Tọa độ: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p>• API Key: {ready ? '✅ Đã load' : '❌ Chưa load'}</p>
        <p>• Status: {status}</p>
        <p>• Số gợi ý: {data.length}</p>
      </div>
    </div>
  );
} 
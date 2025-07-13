// src/components/common/LocationSelectorMap.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents,useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix lỗi icon không hiển thị (đã có trong MyMap, nhưng đảm bảo ở đây cũng có)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component điều chỉnh view khi props center thay đổi (có thể dùng lại từ MyMap)
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const LocationSelectorMap = ({ onLocationSelect, initialLatitude, initialLongitude }) => {
  // Sử dụng vị trí ban đầu nếu có, hoặc mặc định là trung tâm TP.HCM
  const [selectedPosition, setSelectedPosition] = useState(
    (initialLatitude && initialLongitude) ? [parseFloat(initialLatitude), parseFloat(initialLongitude)] : [10.762622, 106.660172]
  );
  const [mapInstance, setMapInstance] = useState(null);

  // Cập nhật vị trí khi initialLatitude/initialLongitude thay đổi từ bên ngoài
  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      const newLat = parseFloat(initialLatitude);
      const newLng = parseFloat(initialLongitude);
      if (selectedPosition[0] !== newLat || selectedPosition[1] !== newLng) {
        setSelectedPosition([newLat, newLng]);
        if (mapInstance) {
            mapInstance.setView([newLat, newLng], mapInstance.getZoom());
        }
      }
    }
  }, [initialLatitude, initialLongitude, mapInstance, selectedPosition]);

  // Hook để xử lý sự kiện click trên bản đồ
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setSelectedPosition([lat, lng]);
        onLocationSelect(lat, lng); // Gọi callback để truyền tọa độ về component cha
      },
    });
    return null;
  };

  const handleMarkerDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng();
    setSelectedPosition([lat, lng]);
    onLocationSelect(lat, lng); // Gọi callback để truyền tọa độ về component cha
  };

  return (
    <MapContainer
      center={selectedPosition}
      zoom={13}
      scrollWheelZoom={true}
      whenCreated={setMapInstance} // Lấy instance của map
      style={{ height: '400px', width: '100%', borderRadius: '8px', zIndex: 0 }} // zIndex để đảm bảo map hiển thị đúng
    >
      <ChangeMapView center={selectedPosition} zoom={13} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="
https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
      />
      {selectedPosition && (
        <Marker
          position={selectedPosition}
          draggable={true} // Cho phép kéo marker
          eventHandlers={{ dragend: handleMarkerDragEnd }}
        >
          <Popup>
            Vĩ độ: {selectedPosition[0].toFixed(6)} <br />
            Kinh độ: {selectedPosition[1].toFixed(6)}
          </Popup>
        </Marker>
      )}
      <MapClickHandler />
    </MapContainer>
  );
};

export default LocationSelectorMap;
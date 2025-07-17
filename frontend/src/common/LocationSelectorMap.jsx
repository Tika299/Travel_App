import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ✅ Fix lỗi icon không hiển thị
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ✅ Component để thay đổi vị trí bản đồ khi props thay đổi
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const LocationSelectorMap = ({ onLocationSelect, initialLatitude, initialLongitude }) => {
  const [selectedPosition, setSelectedPosition] = useState(
    (initialLatitude && initialLongitude)
      ? [parseFloat(initialLatitude), parseFloat(initialLongitude)]
      : [10.762622, 106.660172] // Mặc định là TP.HCM
  );
  const [mapInstance, setMapInstance] = useState(null);

  // ✅ Cập nhật vị trí khi props initialLatitude/initialLongitude thay đổi
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

  // ✅ Xử lý khi click trên bản đồ
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setSelectedPosition([lat, lng]);
        if (typeof onLocationSelect === 'function') {
          onLocationSelect(lat, lng);
        }
      },
    });
    return null;
  };

  // ✅ Xử lý khi kéo thả marker
  const handleMarkerDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng();
    setSelectedPosition([lat, lng]);
    if (typeof onLocationSelect === 'function') {
      onLocationSelect(lat, lng);
    }
  };

  return (
    <MapContainer
      center={selectedPosition}
      zoom={13}
      scrollWheelZoom={true}
      whenCreated={setMapInstance}
      style={{ height: '400px', width: '100%', borderRadius: '8px', zIndex: 0 }}
    >
      <ChangeMapView center={selectedPosition} zoom={13} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {selectedPosition && (
        <Marker
          position={selectedPosition}
          draggable={true}
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

// ✅ Kiểm tra props
LocationSelectorMap.propTypes = {
  onLocationSelect: PropTypes.func,
  initialLatitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialLongitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default LocationSelectorMap;

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix lỗi icon không hiển thị
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component cập nhật vị trí khi lat/lng thay đổi
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center);
  return null;
}

const MyMap = ({ lat, lng }) => {
  const position = [lat, lng];

  return (
    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
      <ChangeView center={position} />
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution="&copy; OpenStreetMap contributors"
/>

      <Marker position={position}>
        <Popup>
          Vĩ độ: {lat} <br />
          Kinh độ: {lng}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MyMap;

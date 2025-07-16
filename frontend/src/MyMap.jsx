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
    <MapContainer center={position} zoom={13} style={{ height: '450px', width: '100%' }}>
      <ChangeView center={position} />


      {/* Lựa chọn thay thế 1: Esri World Street Map */}
      
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
        maxZoom={19}
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
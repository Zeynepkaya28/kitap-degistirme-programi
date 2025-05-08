import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import styled from 'styled-components';
import { Location } from '../types';

const Container = styled.div`
  padding: 20px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const MapContainer = styled.div`
  height: 400px;
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 10px 0;
  
  &:hover {
    background: #0056b3;
  }
`;

interface LocationSelectorProps {
  onLocationSelect: (location: Location) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationSelect }) => {
  const [location, setLocation] = useState<Location>({
    city: '',
    district: '',
  });
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          // Burada reverse geocoding yapılabilir
        },
        (error) => {
          console.error('Konum alınamadı:', error);
          alert('Konum izni verilmedi veya alınamadı.');
        }
      );
    } else {
      alert('Tarayıcınız konum özelliğini desteklemiyor.');
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setUserLocation({ lat, lng });
      // Burada reverse geocoding yapılabilir
    }
  };

  return (
    <Container>
      <h2>Konum Seçimi</h2>
      
      <Select
        value={location.city}
        onChange={(e) => setLocation({ ...location, city: e.target.value })}
      >
        <option value="">İl Seçin</option>
        {/* İl listesi buraya gelecek */}
      </Select>

      <Select
        value={location.district}
        onChange={(e) => setLocation({ ...location, district: e.target.value })}
        disabled={!location.city}
      >
        <option value="">İlçe Seçin</option>
        {/* İlçe listesi buraya gelecek */}
      </Select>

      <Button onClick={handleGetCurrentLocation}>
        Konumumu Kullan
      </Button>

      <MapContainer>
        <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={userLocation || { lat: 41.0082, lng: 28.9784 }} // İstanbul
            zoom={10}
            onClick={handleMapClick}
          >
            {userLocation && (
              <Marker
                position={userLocation}
                draggable={true}
                onDragEnd={(e) => {
                  if (e.latLng) {
                    setUserLocation({
                      lat: e.latLng.lat(),
                      lng: e.latLng.lng()
                    });
                  }
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </MapContainer>

      <p style={{ fontSize: '12px', color: '#666' }}>
        Not: Bu bilgiler sadece eşleştirme amacıyla kullanılır ve gizliliğiniz korunur.
      </p>
    </Container>
  );
};

export default LocationSelector; 
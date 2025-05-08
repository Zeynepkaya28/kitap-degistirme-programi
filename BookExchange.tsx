import React, { useState } from 'react';
import styled from 'styled-components';
import LocationSelector from '../components/LocationSelector';
import DeliveryOptions from '../components/DeliveryOptions';
import { Location, DeliveryOption } from '../types';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 30px;
`;

const BookExchange: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption | null>(null);

  const handleLocationSelect = (selectedLocation: Location) => {
    setLocation(selectedLocation);
  };

  const handleDeliveryOptionSelect = (selectedOption: DeliveryOption) => {
    setDeliveryOption(selectedOption);
  };

  return (
    <Container>
      <Title>Kitap Takas</Title>
      
      <LocationSelector onLocationSelect={handleLocationSelect} />
      
      {location && (
        <DeliveryOptions
          onDeliveryOptionSelect={handleDeliveryOptionSelect}
          isSameCity={true} // Bu değer gerçek uygulamada karşılaştırma yapılarak belirlenecek
        />
      )}
    </Container>
  );
};

export default BookExchange; 
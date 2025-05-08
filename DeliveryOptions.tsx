import React, { useState } from 'react';
import styled from 'styled-components';
import { DeliveryOption, CARGO_COMPANIES } from '../types';

const Container = styled.div`
  padding: 20px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const RadioGroup = styled.div`
  margin: 15px 0;
`;

const RadioLabel = styled.label`
  display: block;
  margin: 10px 0;
  cursor: pointer;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Tooltip = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 5px;
`;

interface DeliveryOptionsProps {
  onDeliveryOptionSelect: (option: DeliveryOption) => void;
  isSameCity: boolean;
}

const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({ onDeliveryOptionSelect, isSameCity }) => {
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>({
    type: 'cargo'
  });

  const handleOptionChange = (type: 'cargo' | 'hand_delivery') => {
    const newOption: DeliveryOption = { type };
    setDeliveryOption(newOption);
    onDeliveryOptionSelect(newOption);
  };

  const handleCargoCompanyChange = (company: string) => {
    const newOption = {
      ...deliveryOption,
      cargoCompany: company as DeliveryOption['cargoCompany']
    };
    setDeliveryOption(newOption);
    onDeliveryOptionSelect(newOption);
  };

  const handleFeePayerChange = (payer: string) => {
    const newOption = {
      ...deliveryOption,
      cargoFeePayer: payer as DeliveryOption['cargoFeePayer']
    };
    setDeliveryOption(newOption);
    onDeliveryOptionSelect(newOption);
  };

  const handleMeetingPointChange = (point: string) => {
    const newOption = {
      ...deliveryOption,
      meetingPoint: point
    };
    setDeliveryOption(newOption);
    onDeliveryOptionSelect(newOption);
  };

  return (
    <Container>
      <h2>Teslimat Seçenekleri</h2>

      <RadioGroup>
        <RadioLabel>
          <input
            type="radio"
            name="deliveryType"
            value="cargo"
            checked={deliveryOption.type === 'cargo'}
            onChange={() => handleOptionChange('cargo')}
          />
          Kargo ile Gönder
        </RadioLabel>

        {deliveryOption.type === 'cargo' && (
          <>
            <Select
              value={deliveryOption.cargoCompany || ''}
              onChange={(e) => handleCargoCompanyChange(e.target.value)}
            >
              <option value="">Kargo Firması Seçin</option>
              {CARGO_COMPANIES.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </Select>

            {deliveryOption.cargoCompany && (
              <Tooltip>
                Tahmini kargo ücreti: {CARGO_COMPANIES.find(c => c.id === deliveryOption.cargoCompany)?.estimatedPrice.min} - 
                {CARGO_COMPANIES.find(c => c.id === deliveryOption.cargoCompany)?.estimatedPrice.max} TL
              </Tooltip>
            )}

            <RadioGroup>
              <RadioLabel>
                <input
                  type="radio"
                  name="feePayer"
                  value="sender"
                  checked={deliveryOption.cargoFeePayer === 'sender'}
                  onChange={() => handleFeePayerChange('sender')}
                />
                Kargo ücretini ben ödeyeceğim
              </RadioLabel>
              <RadioLabel>
                <input
                  type="radio"
                  name="feePayer"
                  value="receiver"
                  checked={deliveryOption.cargoFeePayer === 'receiver'}
                  onChange={() => handleFeePayerChange('receiver')}
                />
                Kargo ücretini alıcı ödeyecek
              </RadioLabel>
              <RadioLabel>
                <input
                  type="radio"
                  name="feePayer"
                  value="split"
                  checked={deliveryOption.cargoFeePayer === 'split'}
                  onChange={() => handleFeePayerChange('split')}
                />
                Kargo ücretini yarı yarıya ödeyelim
              </RadioLabel>
            </RadioGroup>
          </>
        )}

        <RadioLabel>
          <input
            type="radio"
            name="deliveryType"
            value="hand_delivery"
            checked={deliveryOption.type === 'hand_delivery'}
            onChange={() => handleOptionChange('hand_delivery')}
            disabled={!isSameCity}
          />
          Elden Teslim {!isSameCity && '(Sadece aynı şehirdeki kullanıcılar için)'}
        </RadioLabel>

        {deliveryOption.type === 'hand_delivery' && (
          <Input
            type="text"
            placeholder="Buluşma yeri önerisi (örn: AVM, kütüphane)"
            value={deliveryOption.meetingPoint || ''}
            onChange={(e) => handleMeetingPointChange(e.target.value)}
          />
        )}
      </RadioGroup>
    </Container>
  );
};

export default DeliveryOptions; 
export interface Location {
  city: string;
  district: string;
  neighborhood?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DeliveryOption {
  type: 'cargo' | 'hand_delivery';
  cargoCompany?: 'PTT' | 'YURTICI' | 'MNG' | 'ARAS';
  cargoFeePayer?: 'sender' | 'receiver' | 'split';
  meetingPoint?: string;
}

export interface CargoCompany {
  id: string;
  name: string;
  estimatedPrice: {
    min: number;
    max: number;
  };
}

export const CARGO_COMPANIES: CargoCompany[] = [
  {
    id: 'ptt',
    name: 'PTT',
    estimatedPrice: { min: 30, max: 40 }
  },
  {
    id: 'yurtici',
    name: 'Yurtiçi Kargo',
    estimatedPrice: { min: 35, max: 45 }
  },
  {
    id: 'mng',
    name: 'MNG Kargo',
    estimatedPrice: { min: 35, max: 45 }
  },
  {
    id: 'aras',
    name: 'Aras Kargo',
    estimatedPrice: { min: 35, max: 45 }
  }
]; 
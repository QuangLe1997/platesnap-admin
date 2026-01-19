import { Timestamp } from 'firebase/firestore';

// Admin user
export interface AdminUser {
  id?: string;
  username: string;
  email: string;
  displayName: string;
  role: 'admin' | 'superadmin';
  createdAt?: Timestamp;
  lastLoginAt?: Timestamp;
}

// Block (Tòa nhà/Block)
export interface Block {
  id?: string;
  code: string; // e.g., "A", "B", "C"
  name: string; // e.g., "Block A", "Tòa A"
  totalFloors: number;
  description?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Apartment (Căn hộ)
export interface Apartment {
  id?: string;
  code: string; // e.g., "A-101", "B-2501"
  blockId: string;
  blockCode: string; // Denormalized for easier queries
  floor: number;
  roomNumber: string; // e.g., "101", "2501"
  area?: number; // Square meters
  type?: string; // e.g., "1BR", "2BR", "3BR", "Studio"
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Resident (Cư dân)
export interface Resident {
  id?: string;
  fullName: string;
  phone: string;
  email?: string;
  idNumber?: string; // CCCD/CMND
  apartmentId: string;
  apartmentCode: string; // Denormalized
  blockId: string;
  blockCode: string; // Denormalized
  isOwner: boolean; // Chủ hộ hay không
  moveInDate?: Timestamp;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Vehicle (Phương tiện)
export interface Vehicle {
  id?: string;
  plateNumber: string; // Normalized (uppercase, no spaces)
  residentId: string;
  residentName: string; // Denormalized
  apartmentId: string;
  apartmentCode: string; // Denormalized
  blockId: string;
  blockCode: string; // Denormalized
  vehicleType: 'car' | 'motorcycle' | 'bicycle' | 'other';
  brand?: string;
  model?: string;
  color?: string;
  registrationDate?: Timestamp;
  parkingSlot?: string;
  notes?: string;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// For CSV/JSON import
export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

// Search result for mobile app
export interface VehicleSearchResult {
  found: boolean;
  vehicle?: Vehicle;
  resident?: Resident;
  apartment?: Apartment;
  block?: Block;
}

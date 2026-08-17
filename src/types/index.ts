export type PropertyType =
  | "room"
  | "apartment"
  | "house"
  | "townhouse"
  | "bungalow"
  | "villa"
  | "maisonette"
  | "hostel"
  | "studio";

export type HouseSubtype = "standalone" | "semi-detached" | "";

export type AvailabilityStatus = "available" | "pending" | "taken";

export interface Amenity {
  id: string;
  label: string;
  icon: string;
}

export interface ListingUnit {
  id: string;
  status: AvailabilityStatus;
  tenantId?: string;
  pendingSince?: string;
  rentedAt?: string;
}

export interface Listing {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  propertySubtype?: HouseSubtype;
  bedrooms: number;
  bathrooms: number;
  monthlyRent: number;
  deposit: number;
  location: string;
  district: string;
  address: string;
  lat?: number;
  lng?: number;
  photos: string[];
  videoUrl?: string;
  amenities: string[];
  rules: string[];
  isFurnished?: boolean;
  totalUnits: number;
  units: ListingUnit[];
  availableUnits: number;
  pendingUnits: number;
  rentedUnits: number;
  lastConfirmedAt: string;
  isVerified: boolean;
  createdAt: string;
  landlord: LandlordProfile;
  isPaid: boolean;
}

export interface LandlordProfile {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  avatar?: string;
  isVerified: boolean;
  listingsCount: number;
  joinedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "tenant" | "landlord" | "admin";
  avatar?: string;
  isVerified?: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  listingId: string;
  tenantId: string;
  unitId: string;
  amount: number;
  status: "active" | "expired" | "completed" | "cancelled";
  unlockedPhone: string;
  createdAt: string;
  expiresAt: string;
  listing?: Listing;
}

export interface SavedListing {
  id: string;
  tenantId: string;
  listingId: string;
  savedAt: string;
  listing?: Listing;
}

export interface SearchFilters {
  location: string;
  minRent: number | null;
  maxRent: number | null;
  propertyType: PropertyType | "";
  bedrooms: number | null;
  amenities: string[];
  isFurnished?: boolean | null;
}

export interface LandlordVerification {
  landlordId: string;
  profilePhotoUrl?: string;
  idPhotoUrl?: string;
  chairmanLetterUrl?: string;
  status: "pending" | "approved" | "rejected" | "none";
  submittedAt?: string;
}

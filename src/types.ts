export interface Review {
  id: string;
  propertyId: number;
  rating: number;
  comment: string;
  author: string;
  date: string;
  timestamp: number;
}

export interface Property {
  id: number;
  title: string;
  category: string;
  location: string;
  exactAddress: string;
  price: number;
  sqft: number;
  beds: number;
  baths: number;
  ownerName: string;
  ownerPhone: string;
  image: string;
  isAvailable?: boolean;
  featured?: boolean;
  createdAt?: string;
  reviews?: Review[];
  avgRating?: number;
  reviewCount?: number;
}

export interface Order {
  id: string;
  phone: string;
  method: string;
  trxId: string;
  amount: number;
  propertyId?: number;
  propertyTitle?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
  timestamp: number;
}

export interface SiteSettings {
  unlockFee: number;
  bkashNumber: string;
  address: string;
  helpPhone: string;
  email: string;
  fbLink: string;
  waLink: string;
  ytLink: string;
  tgLink: string;
  websiteUrl?: string;
}

export interface AdminStats {
  totalListings: number;
  pendingOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  totalRevenue: number;
}

export interface PublicDataResponse {
  settings: SiteSettings;
  categories: string[];
  properties: Property[];
  version?: number;
  timestamp?: number;
  isUnlocked?: boolean;
}

export interface AdminDataResponse {
  settings: SiteSettings & { adminPass?: string };
  categories: string[];
  properties: Property[];
  orders: Order[];
  stats: AdminStats;
  version?: number;
}

export type AutoRefreshInterval = 'off' | '10s' | '20s' | '45s' | '60s';

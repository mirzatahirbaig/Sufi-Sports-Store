export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PagedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  isFeatured: boolean;
  isActive: boolean;
  imageUrls: string[];
  specifications?: Record<string, string>;
}

export interface Banner {
  id: number;
  imageUrl: string;
  targetUrl: string;
  callToAction: string;
  displayOrder: number;
  startDate: string;
  endDate: string;
  isEnabled: boolean;
}

export interface ContactInfo {
  id: number;
  address: string;
  phone: string;
  email: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  latitude: number;
  longitude: number;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  coverImageUrl: string;
  author: string;
  publishedDate: string;
  status: number;
}

export interface SubmitContactMessageCommand {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

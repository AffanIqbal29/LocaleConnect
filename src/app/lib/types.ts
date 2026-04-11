/**
 * @fileOverview Core TypeScript interfaces for the LocaleConnect data model.
 */

export type UserRole = 'customer' | 'vendor';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
}

export interface Shop {
  id: string;
  vendorId: string;
  name: string;
  type: string;
  description: string;
  location: string;
  hours: string;
  rating: number;
  imageUrl: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stockQuantity: number;
  isActive: boolean;
  createdAt: Date;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  shopId: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: Date;
}

export interface Review {
  id: string;
  customerId: string;
  shopId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

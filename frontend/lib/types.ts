// ============================================
// Type definitions for the Nexcart platform
// ============================================

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: "admin" | "vendor" | "customer";
  isApproved: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  favorites?: string[];
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  vendor: {
    _id: string;
    name: string;
  } | string;
  category: string;
  images: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  _id?: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

export interface OrderItem {
  product: Product | string;
  quantity: number;
  price: number;
  vendor: string;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "paid" | "shipped" | "delivered";
  paymentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export interface Banner {
  _id: string;
  title: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

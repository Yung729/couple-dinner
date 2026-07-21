export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token?: string;
  tokenType?: string;
  user: User;
  partner?: User;
  inviteCode?: string;
  coupleComplete: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface JoinRequest {
  name: string;
  email: string;
  password: string;
  inviteCode: string;
}

export interface Ingredient {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  createdBy?: User;
  createdAt: string;
  ingredients: Ingredient[];
}

export interface MenuItemRequest {
  name: string;
  description?: string;
  ingredients?: string[];
}

export interface Order {
  id: string;
  menuItem?: MenuItem;
  scheduledTime: string;
  status: OrderStatus;
  requestedBy?: User;
  createdAt: string;
}

export type OrderStatus = 'PLANNED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface OrderRequest {
  menuItemId: string;
  scheduledTime: string;
}

export interface FridgeItem {
  id: string;
  ingredientName: string;
  quantity: number;
  unit?: string;
  addedBy?: User;
  updatedAt: string;
}

export interface FridgeItemRequest {
  ingredientName: string;
  quantity: number;
  unit?: string;
}

export interface MissingIngredientsResponse {
  missing: string[];
  messageEn: string;
  messageZh: string;
  canProceed: boolean;
}

export interface SseEvent {
  type: string;
  payload: any;
}

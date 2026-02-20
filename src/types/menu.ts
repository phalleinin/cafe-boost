// MenuItem type

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  is_available: boolean;
  popular?: boolean;
}

export interface CartItem extends MenuItem {
  sugarLevel: string;
  quantity: number;
}
// MenuItem type

export interface MenuItem {
  id: string;
  cafe_id: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  image_url: string | null;
  created_at: string;
}

export interface CartItem extends MenuItem {
  sugarLevel: string;
  quantity: number;
}
import { type MenuItem } from "@/types/menu";

// Map cafe id -> menu items for that cafe
export const mockMenu: Record<string, MenuItem[]> = {
  "1": [
    {
      id: "1",
      name: "Caramel Macchiato",
      description: "Rich espresso with steamed milk and caramel drizzle",
      price: 5.5,
      category: "Hot Drinks",
      image: "/images/caramel.jpg",
      popular: true,
    },
    {
      id: "2",
      name: "Iced Vanilla Latte",
      description: "Smooth espresso with vanilla syrup over ice",
      price: 4.75,
      category: "Cold Drinks",
      image: "/images/vanilla.jpg",
      popular: true,
    },
  ],
  "2": [
    // Another cafe example (can reuse same items for now)
    {
      id: "3",
      name: "Cappuccino",
      description: "Espresso with steamed milk foam",
      price: 3.25,
      category: "Hot Drinks",
      image: "/images/cappuccino.jpg",
      popular: false,
    },
  ],
};

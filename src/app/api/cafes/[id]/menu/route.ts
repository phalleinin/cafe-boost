import { NextResponse } from "next/server";
import type { MenuItem } from "@/types/menu";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: cafeId } = await context.params;

  const menuByCafe: Record<string, MenuItem[]> = {
    "1": [
      {
        id: "1",
        name: "Café Latte",
        description: "Rich espresso with steamed milk",
        price: 3.5,
        category: "Coffee",
        image: "/images/latte.jpg",
        popular: true,
      },
      {
        id: "2",
        name: "Americano",
        description: "Smooth black coffee",
        price: 2.5,
        category: "Coffee",
        image: "/images/americano.jpg",
      },
    ],
    "2": [
      {
        id: "3",
        name: "Matcha Latte",
        description: "Premium matcha with milk",
        price: 4,
        category: "Tea",
        image: "/images/matcha.jpg",
        popular: true,
      },
    ],
  };

  const menu = menuByCafe[cafeId];

  if (!menu) {
    return NextResponse.json(
      { message: "Cafe not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(menu);
}

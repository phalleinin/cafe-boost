import { type MenuItem } from "@/types/menu";

interface Props {
  item: MenuItem;
  isOrderEnabled?: boolean;
  onAddToCart?: (item: MenuItem) => void;
}

export default function MenuCard({
  item,
  isOrderEnabled = false,
  onAddToCart,
}: Props) {
  return (
    <div className="border rounded-xl p-4">
      <h3 className="font-semibold">{item.name}</h3>
      <p className="text-sm text-gray-500">{item.description}</p>
      <p className="font-bold mt-2">${item.price}</p>

      {isOrderEnabled && onAddToCart && (
        <button
          type="button"
          onClick={() => onAddToCart(item)}
          className="mt-3 w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800"
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}

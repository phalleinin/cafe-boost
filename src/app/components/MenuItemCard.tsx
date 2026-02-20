type MenuItemProps = {
  name: string;
  price: number;
  is_available: boolean;
};

export default function MenuItemCard({
  name,
  price,
  is_available,
}: MenuItemProps) {
  return (
    <div className="border rounded-xl p-4 flex justify-between items-center">
      <div>
        <h4 className="font-medium">{name}</h4>
        <p className="text-sm text-gray-500">${price.toFixed(2)}</p>
      </div>

      <span
        className={`text-xs px-2 py-1 rounded-full ${
          is_available
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {is_available ? "Available" : "Sold out"}
      </span>
    </div>
  );
}

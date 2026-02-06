interface Props {
  title: string;
  description: string;
  onSelect: () => void;
}

export default function PaymentMethodCard({
  title,
  description,
  onSelect,
}: Props) {
  return (
    <button
      onClick={onSelect}
      className="border rounded-xl p-4 text-left hover:border-brown-700 transition"
    >
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </button>
  );
}

type CafeCardProps = {
  id: number;
  name: string;
  location: string;
};

export default function CafeCard({ id, name, location }: CafeCardProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-sm text-gray-500">{location}</p>

      <a
        href={`/cafes/${id}`}
        className="inline-block mt-3 text-sm text-blue-600 hover:underline"
      >
        View Menu →
      </a>
    </div>
  );
}

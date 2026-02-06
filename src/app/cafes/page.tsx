import CafeCard from "../components/CafeCard";

const mockCafes = [
  {
    id: 1,
    name: "Brown Coffee & Bakery",
    location: "BKK1, Phnom Penh",
  },
  {
    id: 2,
    name: "Lot 369 Café",
    location: "Street 369, Toul Tom Poung",
  },
  {
    id: 3,
    name: "Cafe Amazon",
    location: "Russian Market Area",
  },
  {
    id: 4,
    name: "Enso Café",
    location: "Street 240, Daun Penh",
  },
  {
    id: 5,
    name: "Feel Good Coffee",
    location: "BKK3, Phnom Penh",
  },
];


export default function CafesPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold mb-6">Explore Cafés</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {mockCafes.map((cafe) => (
          <CafeCard
            key={cafe.id}
            id={cafe.id}
            name={cafe.name}
            location={cafe.location}
          />
        ))}
      </div>
    </section>
  );
}

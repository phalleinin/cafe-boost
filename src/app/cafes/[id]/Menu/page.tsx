import { mockMenu } from "@/data/MockMenu";
import MenuCard from "@/app/components/MenuCard";
import type { MenuItem } from "@/types/menu";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CafePublicPage({ params }: PageProps) {
  const { id } = await params;

  const menu: MenuItem[] = mockMenu[id] ?? [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Artisan Brew House
      </h1>

      {menu.length === 0 ? (
        <p>No menu available.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {menu.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

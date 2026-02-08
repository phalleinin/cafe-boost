import { supabase } from "@/lib/supabase/server";
import MenuCard from "@/app/components/MenuCard";
import type { MenuItem } from "@/types/menu";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CafePublicPage({ params }: PageProps) {
  const { id: cafeId } = await params;

  const { data: menu, error } = await supabase
    .from("menus")
    .select("*")
    .eq("cafe_id", cafeId)
    .order("category", { ascending: true })
    .order("price", { ascending: true });

  if (error) {
    console.error(error);
    return <p>Failed to load menu.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Cafe Menu
      </h1>

      {menu?.length === 0 ? (
        <p>No menu available.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {menu?.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { fetchAllRows } from "@/lib/supabase/fetch-all";
import DrinkResults from "@/components/drinks/DrinkResults";
import DrinkFilterForm from "@/components/drinks/DrinkFilterForm";
import SearchTracker from "@/components/analytics/SearchTracker";

export const metadata: Metadata = {
  title: "음료 검색 | 카페인노트",
  description: "브랜드별 카페 음료의 카페인·칼로리·당류 정보를 검색하고 비교해보세요.",
  // Fixed regardless of query filters — every ?q=/brand=/size= combination
  // is the same underlying page, not distinct content worth indexing apart.
  alternates: { canonical: "/drinks" },
};

interface Filters {
  q?: string;
  brand?: string;
  size?: string;
  caffeine_min?: string;
  caffeine_max?: string;
  sugar_min?: string;
  sugar_max?: string;
  cal_min?: string;
  cal_max?: string;
}

export default async function DrinksPage({
  searchParams,
}: {
  searchParams: Promise<Filters>;
}) {
  const filters = await searchParams;
  const supabase = await createClient();

  const [{ data: brands }, drinks] = await Promise.all([
    supabase.from("brands").select("name, slug").order("name"),
    fetchAllRows((from, to) =>
      supabase
        .from("drinks")
        .select("*, brands(name, slug), drink_nutrition(*)")
        .order("id")
        .range(from, to),
    ),
  ]);

  const results = drinks.filter((drink) => {
    const nutrition = drink.drink_nutrition?.[0];

    if (filters.q) {
      const q = filters.q.toLowerCase();
      const matches =
        drink.name_ko.toLowerCase().includes(q) ||
        (drink.name_en?.toLowerCase().includes(q) ?? false);
      if (!matches) return false;
    }
    if (filters.brand && drink.brands?.slug !== filters.brand) return false;
    if (filters.size && drink.size !== filters.size) return false;
    if (filters.caffeine_min && (nutrition?.caffeine_mg ?? 0) < Number(filters.caffeine_min))
      return false;
    if (
      filters.caffeine_max &&
      (nutrition?.caffeine_mg ?? Infinity) > Number(filters.caffeine_max)
    )
      return false;
    if (filters.sugar_min && (nutrition?.sugar_g ?? 0) < Number(filters.sugar_min)) return false;
    if (filters.sugar_max && (nutrition?.sugar_g ?? Infinity) > Number(filters.sugar_max))
      return false;
    if (filters.cal_min && (nutrition?.calories_kcal ?? 0) < Number(filters.cal_min)) return false;
    if (filters.cal_max && (nutrition?.calories_kcal ?? Infinity) > Number(filters.cal_max))
      return false;

    return true;
  });

  const suggestions = Array.from(new Set(drinks.map((d) => d.name_ko)));

  // One row per (brand, size) so the filter form can narrow the size
  // dropdown to only sizes that exist for the selected brand.
  const brandSizesMap = new Map<string, { brandSlug: string; size: string }>();
  for (const d of drinks) {
    if (d.size && d.brands?.slug) {
      brandSizesMap.set(`${d.brands.slug} ${d.size}`, { brandSlug: d.brands.slug, size: d.size });
    }
  }
  const brandSizes = Array.from(brandSizesMap.values());

  return (
    <main className="flex-1 p-8 flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold">음료 검색</h1>

      {filters.q && <SearchTracker searchTerm={filters.q} resultCount={results.length} />}

      <DrinkFilterForm
        brands={brands ?? []}
        brandSizes={brandSizes}
        suggestions={suggestions}
        defaults={filters}
      />

      <DrinkResults results={results} />
    </main>
  );
}

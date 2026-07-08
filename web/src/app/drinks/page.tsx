import { createClient } from "@/lib/supabase/server";
import DrinkCard from "@/components/drinks/DrinkCard";
import DrinkFilterForm from "@/components/drinks/DrinkFilterForm";

interface Filters {
  q?: string;
  brand?: string;
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

  const [{ data: brands }, { data: drinks }] = await Promise.all([
    supabase.from("brands").select("name, slug").order("name"),
    supabase.from("drinks").select("*, brands(name, slug), drink_nutrition(*)"),
  ]);

  const results = (drinks ?? []).filter((drink) => {
    const nutrition = drink.drink_nutrition?.[0];

    if (filters.q) {
      const q = filters.q.toLowerCase();
      const matches =
        drink.name_ko.toLowerCase().includes(q) ||
        (drink.name_en?.toLowerCase().includes(q) ?? false);
      if (!matches) return false;
    }
    if (filters.brand && drink.brands?.slug !== filters.brand) return false;
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

  const suggestions = Array.from(new Set((drinks ?? []).map((d) => d.name_ko)));

  return (
    <main className="flex-1 p-8 flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold">음료 검색</h1>

      <DrinkFilterForm
        brands={brands ?? []}
        suggestions={suggestions}
        defaults={filters}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((drink) => (
          <DrinkCard key={drink.id} drink={drink} />
        ))}
        {results.length === 0 && (
          <p className="text-ink/60">검색 결과가 없습니다.</p>
        )}
      </div>
    </main>
  );
}

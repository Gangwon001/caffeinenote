import { createClient } from "@/lib/supabase/server";
import DrinkResults from "@/components/drinks/DrinkResults";
import DrinkFilterForm from "@/components/drinks/DrinkFilterForm";

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

  const suggestions = Array.from(new Set((drinks ?? []).map((d) => d.name_ko)));
  const sizes = Array.from(
    new Set((drinks ?? []).map((d) => d.size).filter((size): size is string => Boolean(size))),
  );

  return (
    <main className="flex-1 p-8 flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold">음료 검색</h1>

      <DrinkFilterForm
        brands={brands ?? []}
        sizes={sizes}
        suggestions={suggestions}
        defaults={filters}
      />

      <DrinkResults results={results} />
    </main>
  );
}

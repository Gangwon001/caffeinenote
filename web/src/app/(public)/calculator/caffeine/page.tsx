import { createClient } from "@/lib/supabase/server";
import CaffeineCalculator from "@/components/calculator/CaffeineCalculator";

export default async function CaffeineCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ drinkId?: string; name?: string; caffeine?: string }>;
}) {
  const { drinkId, name, caffeine } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: drinks }, { data: brands }] = await Promise.all([
    supabase
      .from("drinks")
      .select("id, name_ko, size, temperature, brands(name, slug), drink_nutrition(caffeine_mg)"),
    supabase.from("brands").select("name, slug").order("name"),
  ]);

  const catalogDrinks = (drinks ?? [])
    .map((d) => ({
      id: d.id,
      name: d.name_ko,
      caffeineMg: d.drink_nutrition?.[0]?.caffeine_mg ?? 0,
      brandName: d.brands?.name ?? "",
      brandSlug: d.brands?.slug ?? "",
      size: d.size,
      temperature: d.temperature,
    }))
    .filter((d) => d.caffeineMg > 0);

  const initialDrink =
    name && caffeine ? { drinkId, name, caffeineMg: Number(caffeine) } : null;

  return (
    <main className="flex-1 p-8 max-w-2xl mx-auto flex flex-col gap-2">
      <h1 className="font-display text-2xl font-bold">카페인 계산기</h1>
      <p className="text-ink/70 mb-4">
        마신 음료와 취침 예정 시각을 입력하면, 취침 시각 기준 잔존 카페인을 계산해드려요.
      </p>
      <CaffeineCalculator
        isLoggedIn={Boolean(user)}
        catalogDrinks={catalogDrinks}
        brands={brands ?? []}
        initialDrink={initialDrink}
      />
    </main>
  );
}

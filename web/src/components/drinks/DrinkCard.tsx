import Link from "next/link";
import type { Database } from "@/types/supabase";

type Drink = Database["public"]["Tables"]["drinks"]["Row"] & {
  brands: Pick<Database["public"]["Tables"]["brands"]["Row"], "name" | "slug"> | null;
  drink_nutrition: Database["public"]["Tables"]["drink_nutrition"]["Row"][];
};

export default function DrinkCard({ drink }: { drink: Drink }) {
  const nutrition = drink.drink_nutrition?.[0];
  const brandSlug = drink.brands?.slug;

  const card = (
    <div className="rounded-xl border border-brand-soft bg-brand-soft/10 p-4 hover:shadow-sm transition-shadow h-full">
      <p className="text-xs text-ink/60">{drink.brands?.name}</p>
      <h3 className="font-display font-bold mt-1">
        {drink.name_ko}
        {drink.size && <span className="text-ink/60 font-normal"> {drink.size}</span>}
        {drink.temperature && (
          <span className="text-ink/60 font-normal"> {drink.temperature.toUpperCase()}</span>
        )}
      </h3>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-bold tabular-nums">{nutrition?.caffeine_mg ?? "-"}</p>
          <p className="text-xs text-ink/60">카페인mg</p>
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums">{nutrition?.calories_kcal ?? "-"}</p>
          <p className="text-xs text-ink/60">kcal</p>
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums">{nutrition?.sugar_g ?? "-"}</p>
          <p className="text-xs text-ink/60">당류g</p>
        </div>
      </div>
    </div>
  );

  if (!brandSlug) return card;

  return <Link href={`/drinks/${brandSlug}/${drink.slug}`}>{card}</Link>;
}

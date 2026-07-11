"use client";

import { useMemo, useState } from "react";
import DrinkCard from "@/components/drinks/DrinkCard";
import type { Database } from "@/types/supabase";

type Drink = Database["public"]["Tables"]["drinks"]["Row"] & {
  brands: Pick<Database["public"]["Tables"]["brands"]["Row"], "name" | "slug"> | null;
  drink_nutrition: Database["public"]["Tables"]["drink_nutrition"]["Row"][];
};

type Temperature = "all" | "hot" | "ice";

const TABS: { value: Temperature; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "hot", label: "HOT" },
  { value: "ice", label: "ICED" },
];

export default function DrinkResults({ results }: { results: Drink[] }) {
  const [temperature, setTemperature] = useState<Temperature>("all");

  const filtered = useMemo(
    () =>
      temperature === "all" ? results : results.filter((drink) => drink.temperature === temperature),
    [results, temperature],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setTemperature(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              temperature === tab.value
                ? "bg-brand text-bg border-brand"
                : "border-ink/10 hover:bg-brand-soft/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((drink) => (
          <DrinkCard key={drink.id} drink={drink} />
        ))}
        {filtered.length === 0 && <p className="text-ink/60">검색 결과가 없습니다.</p>}
      </div>
    </div>
  );
}

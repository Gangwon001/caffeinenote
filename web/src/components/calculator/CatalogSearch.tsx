"use client";

import { useMemo, useState } from "react";
import { CupIcon, MoonIcon, SearchIcon, ChevronIcon } from "@/components/icons";

export interface CatalogDrink {
  id: string;
  name: string;
  caffeineMg: number;
  brandName: string;
  brandSlug: string;
  size: string | null;
  temperature: string | null;
}

function formatDrinkName(d: CatalogDrink): string {
  return [d.brandName, d.name, d.size, d.temperature?.toUpperCase()].filter(Boolean).join(" ");
}

// Mirrors the home page's 브랜드/사이즈/메뉴 검색 search bar, but filters the
// catalog inline instead of navigating to /drinks — picking a result adds it
// straight to the calculator.
export default function CatalogSearch({
  catalogDrinks,
  brands,
  sizes,
  onPick,
}: {
  catalogDrinks: CatalogDrink[];
  brands: { name: string; slug: string }[];
  sizes: string[];
  onPick: (drink: CatalogDrink) => void;
}) {
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [query, setQuery] = useState("");
  // After picking a result, the search box fills with its name but the
  // results list collapses (rather than re-filtering to just that name) —
  // otherwise it's easy to miss that the drink was actually added below.
  // Any further edit to brand/size/query re-opens the list.
  const [justPicked, setJustPicked] = useState(false);

  const active = Boolean(brand || size || query.trim()) && !justPicked;

  const results = useMemo(() => {
    if (!active) return [];
    const q = query.trim().toLowerCase();
    return catalogDrinks
      .filter(
        (d) =>
          (!brand || d.brandSlug === brand) &&
          (!size || d.size === size) &&
          (!q || d.name.toLowerCase().includes(q)),
      )
      .slice(0, 30);
  }, [catalogDrinks, brand, size, query, active]);

  function handleBrandChange(value: string) {
    setBrand(value);
    setJustPicked(false);
  }
  function handleSizeChange(value: string) {
    setSize(value);
    setJustPicked(false);
  }
  function handleQueryChange(value: string) {
    setQuery(value);
    setJustPicked(false);
  }
  function handlePick(drink: CatalogDrink) {
    onPick(drink);
    setQuery(formatDrinkName(drink));
    setJustPicked(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full flex flex-wrap items-end gap-2 bg-bg border border-ink/10 rounded-xl p-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="flex items-center gap-1.5 text-ink/70">
            <CupIcon className="w-4 h-4" /> 브랜드
          </span>
          <select
            value={brand}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="rounded-md border border-ink/15 bg-bg px-3 py-2 text-sm"
          >
            <option value="">전체 브랜드</option>
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        <ChevronIcon className="w-4 h-4 text-ink/30 mb-2.5" />

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="flex items-center gap-1.5 text-ink/70">
            <CupIcon className="w-4 h-4" /> 사이즈
          </span>
          <select
            value={size}
            onChange={(e) => handleSizeChange(e.target.value)}
            className="rounded-md border border-ink/15 bg-bg px-3 py-2 text-sm"
          >
            <option value="">전체 사이즈</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <ChevronIcon className="w-4 h-4 text-ink/30 mb-2.5" />

        <label className="flex-1 min-w-[200px] flex flex-col gap-1.5 text-sm">
          <span className="flex items-center gap-1.5 text-ink/70">
            <MoonIcon className="w-4 h-4" /> 메뉴 검색
          </span>
          <div className="flex gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="메뉴명을 입력하세요"
              className="flex-1 rounded-md border border-ink/15 bg-bg px-3 py-2 text-sm"
            />
            <button
              type="button"
              aria-label="검색"
              className="rounded-md bg-brand text-bg px-4 py-2 hover:opacity-90"
            >
              <SearchIcon className="w-4 h-4" />
            </button>
          </div>
        </label>
      </div>

      {active &&
        (results.length > 0 ? (
          <ul className="flex flex-col max-h-72 overflow-y-auto rounded-md border border-ink/10 divide-y divide-ink/10">
            {results.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => handlePick(d)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-brand-soft/30"
                >
                  <span>
                    <span className="text-ink/50">{d.brandName}</span> {d.name}
                    {d.size && <span className="text-ink/60"> {d.size}</span>}
                    {d.temperature && (
                      <span className="text-ink/60"> {d.temperature.toUpperCase()}</span>
                    )}
                  </span>
                  <span className="tabular-nums text-ink/70 shrink-0">{d.caffeineMg}mg</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink/50">검색 결과가 없습니다.</p>
        ))}
    </div>
  );
}

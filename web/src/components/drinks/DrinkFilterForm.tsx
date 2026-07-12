"use client";

import { useMemo, useRef, useState } from "react";

const RECENT_SEARCHES_KEY = "caffeinenote:recent-searches";
const MAX_RECENT = 5;

function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (!query.trim()) return;
  const existing = loadRecentSearches().filter((q) => q !== query);
  const updated = [query, ...existing].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

export default function DrinkFilterForm({
  brands,
  brandSizes,
  suggestions,
  defaults,
}: {
  brands: { slug: string; name: string }[];
  brandSizes: { brandSlug: string; size: string }[];
  suggestions: string[];
  defaults: {
    q?: string;
    brand?: string;
    size?: string;
    caffeine_min?: string;
    caffeine_max?: string;
    sugar_min?: string;
    sugar_max?: string;
    cal_min?: string;
    cal_max?: string;
  };
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(defaults.q ?? "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecentSearches);
  const [brand, setBrand] = useState(defaults.brand ?? "");
  const [size, setSize] = useState(defaults.size ?? "");

  // Only the sizes that exist for the selected brand — picking a brand
  // narrows the size dropdown instead of showing every brand's sizes.
  const availableSizes = useMemo(() => {
    const set = new Set(
      brandSizes.filter((bs) => !brand || bs.brandSlug === brand).map((bs) => bs.size),
    );
    return [...set];
  }, [brandSizes, brand]);

  function handleBrandChange(value: string) {
    setBrand(value);
    const stillValid = brandSizes.some((bs) => (!value || bs.brandSlug === value) && bs.size === size);
    if (!stillValid) setSize("");
  }

  const matches = query
    ? suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  function submitWith(value: string) {
    setQuery(value);
    saveRecentSearch(value);
    setRecentSearches(loadRecentSearches());
    setShowDropdown(false);
    if (inputRef.current) inputRef.current.value = value;
    formRef.current?.requestSubmit();
  }

  return (
    <form
      ref={formRef}
      method="get"
      className="flex flex-col gap-3"
      onSubmit={() => {
        saveRecentSearch(query);
        setRecentSearches(loadRecentSearches());
      }}
    >
      <div className="relative max-w-sm">
        <input
          ref={inputRef}
          type="text"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder="음료 이름으로 검색"
          autoComplete="off"
          className="w-full rounded-md border border-ink/10 bg-bg px-3 py-2"
        />
        {showDropdown && (matches.length > 0 || (!query && recentSearches.length > 0)) && (
          <ul className="absolute z-10 mt-1 w-full rounded-md border border-ink/10 bg-bg shadow-sm overflow-hidden">
            {(query ? matches : recentSearches).map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => submitWith(item)}
                  className="w-full text-left px-3 py-2 hover:bg-brand-soft/30 text-sm"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1 text-sm">
          브랜드
          <select
            name="brand"
            value={brand}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="rounded-md border border-ink/10 bg-bg px-3 py-2"
          >
            <option value="">전체</option>
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          사이즈
          <select
            name="size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="rounded-md border border-ink/10 bg-bg px-3 py-2"
          >
            <option value="">전체</option>
            {availableSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          카페인(mg) 최소
          <input
            type="number"
            name="caffeine_min"
            defaultValue={defaults.caffeine_min ?? ""}
            className="w-28 rounded-md border border-ink/10 bg-bg px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          카페인(mg) 최대
          <input
            type="number"
            name="caffeine_max"
            defaultValue={defaults.caffeine_max ?? ""}
            className="w-28 rounded-md border border-ink/10 bg-bg px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          당류(g) 최소
          <input
            type="number"
            name="sugar_min"
            defaultValue={defaults.sugar_min ?? ""}
            className="w-24 rounded-md border border-ink/10 bg-bg px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          당류(g) 최대
          <input
            type="number"
            name="sugar_max"
            defaultValue={defaults.sugar_max ?? ""}
            className="w-24 rounded-md border border-ink/10 bg-bg px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          칼로리 최소
          <input
            type="number"
            name="cal_min"
            defaultValue={defaults.cal_min ?? ""}
            className="w-24 rounded-md border border-ink/10 bg-bg px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          칼로리 최대
          <input
            type="number"
            name="cal_max"
            defaultValue={defaults.cal_max ?? ""}
            className="w-24 rounded-md border border-ink/10 bg-bg px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-brand text-bg px-4 py-2 font-medium hover:opacity-90"
        >
          검색
        </button>
      </div>
    </form>
  );
}

"use client";

import { useMemo, useState } from "react";
import { CupIcon, MoonIcon, SearchIcon, ChevronIcon } from "@/components/icons";

export default function HomeSearchForm({
  brands,
  brandSizes,
}: {
  brands: { name: string; slug: string }[];
  brandSizes: { brandSlug: string; size: string }[];
}) {
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");

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

  return (
    <form
      action="/drinks"
      className="w-full flex flex-wrap items-end gap-2 bg-bg border border-ink/10 rounded-xl p-4"
    >
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="flex items-center gap-1.5 text-ink/70">
          <CupIcon className="w-4 h-4" /> 브랜드
        </span>
        <select
          name="brand"
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
          name="size"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="rounded-md border border-ink/15 bg-bg px-3 py-2 text-sm"
        >
          <option value="">전체 사이즈</option>
          {availableSizes.map((s) => (
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
            name="q"
            placeholder="메뉴명을 입력하세요"
            className="flex-1 rounded-md border border-ink/15 bg-bg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            aria-label="검색"
            className="rounded-md bg-brand text-bg px-4 py-2 hover:opacity-90"
          >
            <SearchIcon className="w-4 h-4" />
          </button>
        </div>
      </label>
    </form>
  );
}

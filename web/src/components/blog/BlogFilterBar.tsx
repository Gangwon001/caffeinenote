"use client";

import { useRef } from "react";
import { BLOG_CATEGORIES } from "@/lib/blog-categories";

export default function BlogFilterBar({
  defaults,
}: {
  defaults: { q?: string; category?: string; sort?: string };
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);

  function selectCategory(value: string) {
    if (categoryRef.current) categoryRef.current.value = value;
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} method="get" className="flex flex-col gap-3">
      <input ref={categoryRef} type="hidden" name="category" defaultValue={defaults.category ?? ""} />

      <div className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={defaults.q ?? ""}
          placeholder="블로그 글을 검색하세요 (예: 카페인, 수면, 라떼)"
          className="flex-1 rounded-md border border-ink/15 bg-bg px-4 py-2.5"
        />
        <button
          type="submit"
          className="shrink-0 whitespace-nowrap rounded-md bg-brand text-bg px-6 py-2.5 font-medium hover:opacity-90"
        >
          검색
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => selectCategory("")}
          className={`rounded-full px-4 py-1.5 text-sm border ${
            !defaults.category
              ? "bg-brand text-bg border-brand"
              : "border-ink/15 hover:bg-brand-soft"
          }`}
        >
          전체
        </button>
        {BLOG_CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => selectCategory(c.value)}
            className={`rounded-full px-4 py-1.5 text-sm border ${
              defaults.category === c.value
                ? "bg-brand text-bg border-brand"
                : "border-ink/15 hover:bg-brand-soft"
            }`}
          >
            {c.value}
          </button>
        ))}

        <select
          name="sort"
          defaultValue={defaults.sort ?? "latest"}
          onChange={() => formRef.current?.requestSubmit()}
          className="ml-auto rounded-md border border-ink/15 bg-bg px-3 py-1.5 text-sm"
        >
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
        </select>
      </div>
    </form>
  );
}

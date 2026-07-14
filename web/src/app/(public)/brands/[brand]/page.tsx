import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import DrinkCard from "@/components/drinks/DrinkCard";

const getBrand = cache(async (brandSlug: string) => {
  const supabase = await createClient();
  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", brandSlug)
    .maybeSingle();
  return brand;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: brandSlug } = await params;
  const brand = await getBrand(brandSlug);
  if (!brand) return {};

  const canonical = `/brands/${brandSlug}`;
  const description = `${brand.name}의 전체 메뉴별 카페인·칼로리·당류 정보를 확인해보세요.`;
  return {
    title: `${brand.name} 메뉴 카페인 정보 | 카페인노트`,
    description,
    alternates: { canonical },
    openGraph: { title: brand.name, description, url: canonical },
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandSlug } = await params;
  const brand = await getBrand(brandSlug);

  if (!brand) {
    notFound();
  }

  const supabase = await createClient();
  const { data: drinks } = await supabase
    .from("drinks")
    .select("*, brands(name, slug), drink_nutrition(*)")
    .eq("brand_id", brand.id);

  return (
    <main className="flex-1 p-8 flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold">{brand.name}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {drinks?.map((drink) => (
          <DrinkCard key={drink.id} drink={drink} />
        ))}
        {(!drinks || drinks.length === 0) && (
          <p className="text-ink/60">등록된 메뉴가 없습니다.</p>
        )}
      </div>
    </main>
  );
}

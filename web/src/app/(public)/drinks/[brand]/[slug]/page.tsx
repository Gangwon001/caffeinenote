import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const getDrinkDetail = cache(async (brandSlug: string, slug: string) => {
  const supabase = await createClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", brandSlug)
    .maybeSingle();

  if (!brand) return null;

  const { data: drink } = await supabase
    .from("drinks")
    .select("*, drink_nutrition(*)")
    .eq("brand_id", brand.id)
    .eq("slug", slug)
    .maybeSingle();

  if (!drink) return null;

  return { brand, drink };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; slug: string }>;
}): Promise<Metadata> {
  const { brand: brandSlug, slug } = await params;
  const result = await getDrinkDetail(brandSlug, slug);

  if (!result) return {};

  const { brand, drink } = result;
  const nutrition = drink.drink_nutrition?.[0];
  const title = `${drink.name_ko}${drink.size ? ` ${drink.size}` : ""} 카페인·칼로리 | ${brand.name}`;
  const description = `${brand.name} ${drink.name_ko}의 카페인 ${nutrition?.caffeine_mg ?? "-"}mg, 칼로리 ${nutrition?.calories_kcal ?? "-"}kcal, 당류 ${nutrition?.sugar_g ?? "-"}g 정보.`;
  const canonical = `/drinks/${brandSlug}/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default async function DrinkDetailPage({
  params,
}: {
  params: Promise<{ brand: string; slug: string }>;
}) {
  const { brand: brandSlug, slug } = await params;
  const result = await getDrinkDetail(brandSlug, slug);

  if (!result) {
    notFound();
  }

  const { brand, drink } = result;
  const nutrition = drink.drink_nutrition?.[0];

  const supabase = await createClient();
  const { data: relatedPosts } = await supabase
    .from("blog_posts")
    .select("id, title, slug")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: `${drink.name_ko}${drink.size ? ` ${drink.size}` : ""}`,
    ...(nutrition && {
      nutrition: {
        "@type": "NutritionInformation",
        ...(nutrition.caffeine_mg != null && {
          caffeineContent: `${nutrition.caffeine_mg} mg`,
        }),
        ...(nutrition.calories_kcal != null && {
          calories: `${nutrition.calories_kcal} calories`,
        }),
        ...(nutrition.sugar_g != null && { sugarContent: `${nutrition.sugar_g} g` }),
      },
    }),
  };

  return (
    <main className="flex-1 p-8 max-w-2xl mx-auto flex flex-col gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        <p className="text-sm text-ink/60">
          <Link href={`/brands/${brand.slug}`} className="underline">
            {brand.name}
          </Link>
        </p>
        <h1 className="font-display text-2xl font-bold">
          {drink.name_ko}
          {drink.size && <span className="text-ink/60 font-normal"> {drink.size}</span>}
          {drink.temperature && (
            <span className="text-ink/60 font-normal"> {drink.temperature.toUpperCase()}</span>
          )}
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-ink/10 p-4 text-center">
          <p className="text-2xl font-bold tabular-nums">{nutrition?.caffeine_mg ?? "-"}</p>
          <p className="text-sm text-ink/60">카페인mg</p>
        </div>
        <div className="rounded-lg border border-ink/10 p-4 text-center">
          <p className="text-2xl font-bold tabular-nums">{nutrition?.calories_kcal ?? "-"}</p>
          <p className="text-sm text-ink/60">칼로리kcal</p>
        </div>
        <div className="rounded-lg border border-ink/10 p-4 text-center">
          <p className="text-2xl font-bold tabular-nums">{nutrition?.sugar_g ?? "-"}</p>
          <p className="text-sm text-ink/60">당류g</p>
        </div>
      </div>

      {nutrition?.allergens && nutrition.allergens.length > 0 && (
        <p className="text-sm text-ink/70">알러지 정보: {nutrition.allergens.join(", ")}</p>
      )}

      {(nutrition?.caffeine_mg ?? 0) > 0 && (
        <p className="text-sm text-night bg-night/10 rounded-md p-3">
          취침 6시간 이내 섭취 시 카페인에 민감한 분은 수면에 영향을 받을 수 있습니다. 개인차가
          있으니 참고용으로만 확인해주세요.
        </p>
      )}

      {relatedPosts && relatedPosts.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-bold mb-2">관련 글</h2>
          <ul className="flex flex-col gap-1">
            {relatedPosts.map((post) => (
              <li key={post.id}>
                <Link href={`/blog/${post.slug}`} className="text-brand underline text-sm">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {nutrition && (
        <p className="text-xs text-ink/50 border-t pt-3">
          출처:{" "}
          <a href={nutrition.source_url} target="_blank" rel="noopener noreferrer" className="underline">
            {nutrition.source_url}
          </a>{" "}
          · 확인일 {nutrition.checked_at}
        </p>
      )}
    </main>
  );
}

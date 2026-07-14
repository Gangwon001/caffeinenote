import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { fetchAllRows } from "@/lib/supabase/fetch-all";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const [{ data: brands }, drinks, { data: posts }] = await Promise.all([
    supabase.from("brands").select("slug"),
    fetchAllRows((from, to) =>
      supabase
        .from("drinks")
        .select("slug, size, temperature, brands(slug)")
        .order("id")
        .range(from, to),
    ),
    supabase
      .from("blog_posts")
      .select("slug, published_at, updated_at")
      .eq("status", "published"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/drinks`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/calculator/caffeine`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog`, changeFrequency: "daily", priority: 0.6 },
  ];

  const brandRoutes: MetadataRoute.Sitemap = (brands ?? []).map((brand) => ({
    url: `${baseUrl}/brands/${brand.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const drinkRoutes: MetadataRoute.Sitemap = drinks
    .filter((drink) => drink.brands?.slug)
    .map((drink) => {
      // size/temperature disambiguate rows that share the same (brand, slug) —
      // see the detail page's getDrinkDetail for why this is required.
      const query = new URLSearchParams({
        size: drink.size ?? "",
        temperature: drink.temperature ?? "",
      });
      return {
        // Next's sitemap serializer inserts `url` into <loc> as-is without
        // XML-escaping it, so the raw "&" between query params has to be
        // escaped here or the sitemap comes out as invalid XML.
        url: `${baseUrl}/drinks/${drink.brands!.slug}/${drink.slug}?${query.toString()}`.replace(
          /&/g,
          "&amp;",
        ),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    });

  const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((post) => {
    const lastModified = post.updated_at ?? post.published_at;
    return {
      url: `${baseUrl}/blog/${post.slug}`,
      changeFrequency: "monthly",
      priority: 0.5,
      ...(lastModified && { lastModified: new Date(lastModified) }),
    };
  });

  return [...staticRoutes, ...brandRoutes, ...drinkRoutes, ...postRoutes];
}

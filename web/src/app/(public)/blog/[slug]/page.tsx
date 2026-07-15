import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchAllRows } from "@/lib/supabase/fetch-all";
import { renderTiptapContent, extractFaqPairs } from "@/lib/tiptap-html";
import { safeJsonLd } from "@/lib/json-ld";
import { findMentionedDrinkKeywords } from "@/lib/related-drinks";
import { formatDate } from "@/lib/format-date";
import BlogViewTracker from "@/components/analytics/BlogViewTracker";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function buildCalculatorHref(drink: {
  id: string;
  name_ko: string;
  size: string | null;
  temperature: string | null;
  drink_nutrition: { caffeine_mg: number | null }[];
}) {
  const displayName = [drink.name_ko, drink.size, drink.temperature?.toUpperCase()]
    .filter(Boolean)
    .join(" ");
  const params = new URLSearchParams({
    drinkId: drink.id,
    name: displayName,
    caffeine: String(drink.drink_nutrition?.[0]?.caffeine_mg ?? 0),
  });
  return `/calculator/caffeine?${params.toString()}`;
}

const getPost = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return post;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const canonical = `/blog/${slug}`;
  const description = post.excerpt || post.title;
  return {
    title: `${post.title} | 카페인노트 블로그`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: canonical,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      authors: ["CaffeineNote Team"],
      ...(post.cover_image_url && { images: [post.cover_image_url] }),
    },
    twitter: {
      card: post.cover_image_url ? "summary_large_image" : "summary",
      title: post.title,
      description,
      ...(post.cover_image_url && { images: [post.cover_image_url] }),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const supabase = await createClient();
  await supabase.rpc("increment_blog_view", { post_slug: slug });

  const drinkKeywords = findMentionedDrinkKeywords(`${post.title} ${post.excerpt ?? ""}`);

  const [{ data: popularPosts }, { data: categoryPosts }, allDrinks] = await Promise.all([
    // "인기글" — sorted by actual view_count, never displayed as a number,
    // just used to rank which titles show up here.
    supabase
      .from("blog_posts")
      .select("id, title, slug, published_at")
      .eq("status", "published")
      .neq("slug", slug)
      .order("view_count", { ascending: false })
      .limit(4),
    post.category
      ? supabase
          .from("blog_posts")
          .select("id, title, slug, published_at")
          .eq("status", "published")
          .eq("category", post.category)
          .neq("slug", slug)
          .order("published_at", { ascending: false })
          .limit(3)
      : Promise.resolve({ data: null }),
    drinkKeywords.length > 0
      ? fetchAllRows((from, to) =>
          supabase
            .from("drinks")
            .select("id, name_ko, slug, size, temperature, brands(name, slug), drink_nutrition(caffeine_mg)")
            .order("id")
            .range(from, to),
        )
      : Promise.resolve([]),
  ]);

  const relatedPosts = categoryPosts && categoryPosts.length > 0 ? categoryPosts : (popularPosts ?? []).slice(0, 3);

  const seenDrinkNames = new Set<string>();
  const relatedDrinks = allDrinks
    .filter((d) => drinkKeywords.some((k) => d.name_ko.includes(k)))
    .filter((d) => {
      if (seenDrinkNames.has(d.name_ko)) return false;
      seenDrinkNames.add(d.name_ko);
      return true;
    })
    .slice(0, 4);

  const description = post.excerpt || post.title;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    ...(post.cover_image_url && { image: [post.cover_image_url] }),
    datePublished: post.published_at ?? post.created_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? post.created_at ?? undefined,
    author: { "@type": "Organization", name: "CaffeineNote Team", url: `${SITE_URL}/about` },
    publisher: {
      "@type": "Organization",
      name: "카페인노트",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icons/icon-512.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
  };

  const faqPairs = extractFaqPairs(post.content);
  const faqJsonLd =
    faqPairs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqPairs.map((pair) => ({
            "@type": "Question",
            name: pair.question,
            acceptedAnswer: { "@type": "Answer", text: pair.answer },
          })),
        }
      : null;

  return (
    <main className="flex-1 p-8 max-w-5xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
        />
      )}
      <BlogViewTracker postSlug={post.slug} postTitle={post.title} category={post.category} />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8 items-start">
        <article className="flex flex-col gap-4 min-w-0">
          <div className="rounded-md bg-brand-soft/30 border border-ink/10 p-4 text-sm text-ink/80">
            이 글은 일반적인 정보 제공을 목적으로 하며 의학적 조언이 아닙니다. 개인의 건강 상태에
            따라 전문가와 상담해주세요.
          </div>

          <h1 className="font-display text-2xl font-bold">{post.title}</h1>

          {post.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover_image_url}
              alt=""
              className="w-full aspect-[3/2] object-cover rounded-lg"
            />
          )}

          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: renderTiptapContent(post.content) }}
          />

          {relatedDrinks.length > 0 && (
            <div className="mt-4 pt-6 border-t border-ink/10">
              <h2 className="font-display font-bold mb-2">관련 음료</h2>
              <ul className="flex flex-col gap-1 text-sm">
                {relatedDrinks.map((d) => (
                  <li key={d.id}>
                    <Link href={buildCalculatorHref(d)} className="text-brand underline">
                      {d.brands?.name} {d.name_ko}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <aside className="sticky top-20 flex flex-col gap-4">
          <div className="rounded-lg border border-ink/10 p-4">
            <h2 className="font-display font-bold mb-2">바로가기</h2>
            <ul className="flex flex-col gap-1 text-sm">
              <li>
                <Link href="/drinks" className="text-brand underline">
                  음료 검색
                </Link>
              </li>
              <li>
                <Link href="/calculator/caffeine" className="text-brand underline">
                  카페인 계산기
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-dashed border-ink/10 p-4 text-center text-sm text-ink/50">
            광고 영역
          </div>

          {popularPosts && popularPosts.length > 0 && (
            <div className="rounded-lg border border-ink/10 p-4">
              <h2 className="font-display font-bold mb-2">인기글</h2>
              <ul className="flex flex-col divide-y divide-ink/10">
                {popularPosts.map((p) => (
                  <li key={p.id} className="py-2 first:pt-0 last:pb-0">
                    <Link
                      href={`/blog/${p.slug}`}
                      className="block truncate text-sm text-brand hover:underline"
                    >
                      {p.title}
                    </Link>
                    <span className="text-xs text-ink/50 whitespace-nowrap">
                      {formatDate(p.published_at)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {relatedPosts.length > 0 && (
            <div className="rounded-lg border border-ink/10 p-4">
              <h2 className="font-display font-bold mb-2">관련 글</h2>
              <ul className="flex flex-col divide-y divide-ink/10">
                {relatedPosts.map((p) => (
                  <li key={p.id} className="py-2 first:pt-0 last:pb-0">
                    <Link
                      href={`/blog/${p.slug}`}
                      className="block truncate text-sm text-brand hover:underline"
                    >
                      {p.title}
                    </Link>
                    <span className="text-xs text-ink/50 whitespace-nowrap">
                      {formatDate(p.published_at)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

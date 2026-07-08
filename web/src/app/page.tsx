import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const POPULAR_QUERIES = ["아메리카노", "라떼", "디카페인", "콜드브루", "카푸치노"];

const FEATURE_CARDS = [
  {
    href: "/drinks",
    title: "음료 검색",
    description: "카페인·칼로리·당류로 찾아보기",
  },
  {
    href: "/calculator/caffeine",
    title: "수면 계산기",
    description: "잔존 카페인, 취침 전 확인하기",
  },
  {
    href: "/dashboard",
    title: "내 기록",
    description: "오늘 마신 음료 저장하고 통계 보기",
  },
  {
    href: "/blog",
    title: "블로그",
    description: "카페인과 수면에 관한 이야기",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(4);

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            background: "linear-gradient(120deg, var(--color-day), var(--color-night))",
          }}
        />
        <div className="relative flex flex-col items-center gap-6 px-6 py-20 text-center">
          <h1 className="font-display text-3xl sm:text-4xl font-bold max-w-xl">
            오늘 마신 커피, 밤에 잠을 방해할까요?
          </h1>
          <p className="text-ink/70 max-w-md">
            카페인·칼로리·당류를 검색하고, 취침 시간 기준 잔존 카페인을 계산해보세요.
          </p>

          <form action="/drinks" className="w-full max-w-md flex gap-2">
            <input
              type="search"
              name="q"
              placeholder="음료 이름으로 검색"
              className="flex-1 rounded-full border border-brand-soft bg-bg px-5 py-3"
            />
            <button
              type="submit"
              className="rounded-full bg-brand text-bg px-6 py-3 font-medium hover:opacity-90"
            >
              검색
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR_QUERIES.map((q) => (
              <Link
                key={q}
                href={`/drinks?q=${encodeURIComponent(q)}`}
                className="rounded-full bg-brand-soft/50 border border-brand-soft px-4 py-1.5 text-sm hover:bg-brand-soft"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURE_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-xl border border-brand-soft bg-brand-soft/20 p-6 hover:shadow-sm transition-shadow"
            >
              <h2 className="font-display text-xl font-bold">{card.title}</h2>
              <p className="text-ink/70 mt-1">{card.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {posts && posts.length > 0 && (
        <section className="px-6 py-12 max-w-4xl mx-auto">
          <h2 className="font-display text-xl font-bold mb-4">최신 글</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="rounded-lg border p-4 hover:bg-brand-soft/20"
              >
                {post.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

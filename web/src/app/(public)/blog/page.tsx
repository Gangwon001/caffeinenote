import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { extractTiptapExcerpt } from "@/lib/tiptap-html";
import { getCategoryStyle } from "@/lib/blog-categories";
import { BookIcon, EyeIcon, ChevronIcon } from "@/components/icons";
import BlogHeroIllustration from "@/components/blog/BlogHeroIllustration";
import BlogFilterBar from "@/components/blog/BlogFilterBar";

const PAGE_SIZE = 5;

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
}) {
  const filters = await searchParams;
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published");

  let results = posts ?? [];

  if (filters.q) {
    const q = filters.q.toLowerCase();
    results = results.filter((post) => post.title.toLowerCase().includes(q));
  }
  if (filters.category) {
    results = results.filter((post) => post.category === filters.category);
  }

  results = [...results].sort((a, b) => {
    if (filters.sort === "popular") return b.view_count - a.view_count;
    return (b.published_at ?? "").localeCompare(a.published_at ?? "");
  });

  const currentPage = Math.max(1, Number(filters.page) || 1);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pageResults = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function pageHref(page: number) {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.category) params.set("category", filters.category);
    if (filters.sort) params.set("sort", filters.sort);
    params.set("page", String(page));
    return `/blog?${params.toString()}`;
  }

  return (
    <main className="flex-1">
      <section className="bg-brand-soft/60">
        <div className="max-w-4xl mx-auto px-6 py-14 flex flex-col-reverse sm:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold">블로그</h1>
            <p className="text-ink/70 mt-2">
              카페인, 수면, 건강, 라이프스타일에 대한
              <br />
              다양한 정보와 팁을 전해드립니다.
            </p>
          </div>
          <BlogHeroIllustration />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-6">
        <BlogFilterBar defaults={filters} />

        {pageResults.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {pageResults.map((post) => {
              const style = getCategoryStyle(post.category);
              return (
                <li key={post.id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex gap-4 rounded-lg border border-ink/10 p-4 hover:shadow-sm transition-shadow"
                  >
                    <div
                      className="w-32 sm:w-40 h-24 shrink-0 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: style?.bg ?? "#E8F4EC",
                        color: style?.color ?? "#0F5B3A",
                      }}
                    >
                      <BookIcon className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {post.category && (
                        <span
                          className="inline-block rounded-full px-3 py-0.5 text-xs font-medium mb-1"
                          style={{ backgroundColor: style?.bg, color: style?.color }}
                        >
                          {post.category}
                        </span>
                      )}
                      <h2 className="font-bold">{post.title}</h2>
                      <p className="text-sm text-ink/70 mt-1 line-clamp-2">
                        {extractTiptapExcerpt(post.content)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-ink/50 mt-2">
                        <span>{formatDate(post.published_at)}</span>
                        <span>·</span>
                        <span>CaffeineNote Team</span>
                        <span className="ml-auto flex items-center gap-1">
                          <EyeIcon className="w-3.5 h-3.5" />
                          {post.view_count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-ink/60">조건에 맞는 글이 없습니다.</p>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Link
              href={pageHref(Math.max(1, currentPage - 1))}
              className="text-ink/40 hover:text-brand"
              aria-label="이전 페이지"
            >
              <ChevronIcon className="w-4 h-4 rotate-180" />
            </Link>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={pageHref(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                  page === currentPage ? "bg-brand text-bg" : "hover:bg-brand-soft"
                }`}
              >
                {page}
              </Link>
            ))}
            <Link
              href={pageHref(Math.min(totalPages, currentPage + 1))}
              className="text-ink/40 hover:text-brand"
              aria-label="다음 페이지"
            >
              <ChevronIcon className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

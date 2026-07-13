import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { renderTiptapContent } from "@/lib/tiptap-html";
import BlogViewTracker from "@/components/analytics/BlogViewTracker";

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
      title: post.title,
      description,
      url: canonical,
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

  const { data: popularPosts } = await supabase
    .from("blog_posts")
    .select("id, title, slug")
    .eq("status", "published")
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(4);

  return (
    <main className="flex-1 p-8 max-w-5xl mx-auto">
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
              <ul className="flex flex-col gap-1 text-sm">
                {popularPosts.map((p) => (
                  <li key={p.id}>
                    <Link href={`/blog/${p.slug}`} className="text-brand underline">
                      {p.title}
                    </Link>
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

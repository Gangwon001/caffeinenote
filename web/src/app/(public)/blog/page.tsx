import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function BlogListPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <main className="flex-1 p-8 max-w-2xl mx-auto flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold">블로그</h1>

      {posts && posts.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {posts.map((post) => (
            <li key={post.id} className="rounded-lg border border-ink/10 p-4">
              <Link href={`/blog/${post.slug}`} className="font-display text-lg font-bold hover:underline">
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink/60">아직 등록된 글이 없습니다.</p>
      )}
    </main>
  );
}

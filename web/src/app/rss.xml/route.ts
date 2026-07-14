import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("title, slug, excerpt, published_at, updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  const items = (posts ?? [])
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      const pubDate = new Date(post.published_at ?? post.updated_at ?? Date.now()).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.excerpt ?? post.title)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>카페인노트 블로그</title>
    <link>${SITE_URL}/blog</link>
    <description>카페인, 수면, 건강에 관한 카페인노트 블로그 글 모음</description>
    <language>ko-KR</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

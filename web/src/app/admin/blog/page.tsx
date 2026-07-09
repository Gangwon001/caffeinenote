import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deletePost } from "./actions";

const STATUS_TABS = [
  { value: "", label: "전체" },
  { value: "draft", label: "초안" },
  { value: "published", label: "발행" },
] as const;

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const filters = await searchParams;
  const supabase = await createClient();
  const { data: allPosts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  let posts = allPosts ?? [];
  if (filters.status) {
    posts = posts.filter((post) => post.status === filters.status);
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    posts = posts.filter((post) => post.title.toLowerCase().includes(q));
  }

  return (
    <main className="flex-1 p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">블로그 관리</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-md bg-brand text-bg px-4 py-2 font-medium hover:opacity-90"
        >
          새 글 작성
        </Link>
      </div>

      <form method="get" className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/blog${tab.value ? `?status=${tab.value}` : ""}`}
              className={`rounded-md px-3 py-1.5 text-sm border ${
                (filters.status ?? "") === tab.value
                  ? "bg-brand text-bg border-brand"
                  : "hover:bg-brand-soft"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <input
          type="search"
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="제목 검색"
          className="rounded-md border px-3 py-1.5 text-sm"
        />
        {filters.status && <input type="hidden" name="status" value={filters.status} />}
        <button type="submit" className="rounded-md border px-3 py-1.5 text-sm hover:bg-brand-soft">
          검색
        </button>
      </form>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 pr-4">제목</th>
            <th className="py-2 pr-4">slug</th>
            <th className="py-2 pr-4">카테고리</th>
            <th className="py-2 pr-4">상태</th>
            <th className="py-2 pr-4">조회수</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b">
              <td className="py-2 pr-4">{post.title}</td>
              <td className="py-2 pr-4">{post.slug}</td>
              <td className="py-2 pr-4">{post.category ?? "-"}</td>
              <td className="py-2 pr-4">{post.status === "published" ? "발행" : "초안"}</td>
              <td className="py-2 pr-4 tabular-nums">{post.view_count}</td>
              <td className="py-2 pr-4 flex gap-3">
                <Link href={`/admin/blog/${post.id}/edit`} className="text-brand underline">
                  수정
                </Link>
                <form action={deletePost.bind(null, post.id)}>
                  <button type="submit" className="text-danger underline">
                    삭제
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

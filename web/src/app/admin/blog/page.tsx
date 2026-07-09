import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deletePost } from "./actions";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

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
          {posts?.map((post) => (
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

import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const [{ count: brandCount }, { count: drinkCount }, { count: postCount }] =
    await Promise.all([
      supabase.from("brands").select("*", { count: "exact", head: true }),
      supabase.from("drinks").select("*", { count: "exact", head: true }),
      supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    ]);

  return (
    <main className="flex-1 p-8">
      <h1 className="text-2xl font-bold">관리자 대시보드</h1>
      <div className="mt-6 grid grid-cols-3 gap-4 max-w-2xl">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-ink/60">브랜드</p>
          <p className="text-2xl font-bold tabular-nums">{brandCount ?? 0}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-ink/60">메뉴</p>
          <p className="text-2xl font-bold tabular-nums">{drinkCount ?? 0}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-ink/60">블로그 글</p>
          <p className="text-2xl font-bold tabular-nums">{postCount ?? 0}</p>
        </div>
      </div>
    </main>
  );
}

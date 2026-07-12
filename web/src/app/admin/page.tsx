import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminPage() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const [{ count: brandCount }, { count: drinkCount }, { count: postCount }, { data: userPage }] =
    await Promise.all([
      supabase.from("brands").select("*", { count: "exact", head: true }),
      supabase.from("drinks").select("*", { count: "exact", head: true }),
      supabase.from("blog_posts").select("*", { count: "exact", head: true }),
      adminSupabase.auth.admin.listUsers({ page: 1, perPage: 1 }),
    ]);
  const memberCount = userPage && "total" in userPage ? userPage.total : 0;

  return (
    <main className="flex-1 p-8">
      <h1 className="text-2xl font-bold">관리자 대시보드</h1>
      <div className="mt-6 grid grid-cols-4 gap-4 max-w-3xl">
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
        <div className="rounded-lg border p-4">
          <p className="text-sm text-ink/60">회원</p>
          <p className="text-2xl font-bold tabular-nums">{memberCount}</p>
        </div>
      </div>
    </main>
  );
}

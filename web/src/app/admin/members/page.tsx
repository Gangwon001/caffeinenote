import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

async function fetchAllUsers() {
  const supabase = createAdminClient();
  const perPage = 1000;
  const users: User[] = [];

  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    users.push(...data.users);
    if (data.users.length < perPage) break;
  }

  return users;
}

export default async function AdminMembersPage() {
  const supabase = createAdminClient();
  const [users, { data: roles }] = await Promise.all([
    fetchAllUsers(),
    supabase.from("user_roles").select("user_id, role"),
  ]);

  const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]));
  const sorted = [...users].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <main className="flex-1 p-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">회원 관리</h1>
      <p className="text-sm text-ink/60">총 {users.length}명</p>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 pr-4">이메일</th>
            <th className="py-2 pr-4">가입일</th>
            <th className="py-2 pr-4">최근 로그인</th>
            <th className="py-2 pr-4">권한</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="py-2 pr-4">{u.email}</td>
              <td className="py-2 pr-4">
                {new Date(u.created_at).toLocaleDateString("ko-KR")}
              </td>
              <td className="py-2 pr-4">
                {u.last_sign_in_at
                  ? new Date(u.last_sign_in_at).toLocaleDateString("ko-KR")
                  : "-"}
              </td>
              <td className="py-2 pr-4">
                {roleMap.get(u.id) === "admin" ? "관리자" : "일반"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

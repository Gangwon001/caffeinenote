import { requireUser } from "@/lib/require-user";
import { createClient } from "@/lib/supabase/server";
import { changePassword } from "@/lib/auth-actions";
import { updateSettings } from "./actions";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ pwError?: string; pwMessage?: string }>;
}) {
  const { pwError, pwMessage } = await searchParams;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const dailyLimit = settings?.daily_limit_mg ?? 400;
  const bedtime = settings?.bedtime ?? "23:00:00";
  const sensitivity = settings?.sensitivity ?? "normal";

  return (
    <main className="flex-1 p-8 max-w-2xl mx-auto flex flex-col gap-8">
      <h1 className="font-display text-2xl font-bold">계정 설정</h1>
      <p className="text-sm text-ink/60">{user.email}</p>

      <section>
        <h2 className="font-display text-lg font-bold mb-3">개인 설정</h2>
        <form action={updateSettings} className="flex flex-wrap gap-4 items-end">
          <label className="flex flex-col gap-1 text-sm">
            일일 권장량(mg)
            <input
              type="number"
              name="daily_limit_mg"
              defaultValue={dailyLimit}
              className="rounded-md border border-ink/10 bg-bg px-3 py-2 w-32"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            취침 시각
            <input
              type="time"
              name="bedtime"
              defaultValue={bedtime.slice(0, 5)}
              className="rounded-md border border-ink/10 bg-bg px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            민감도
            <select
              name="sensitivity"
              defaultValue={sensitivity}
              className="rounded-md border border-ink/10 bg-bg px-3 py-2"
            >
              <option value="low">낮음</option>
              <option value="normal">보통</option>
              <option value="high">높음</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-md bg-brand text-bg px-4 py-2 font-medium hover:opacity-90"
          >
            저장
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold mb-3">비밀번호 변경</h2>
        {pwMessage && <p className="text-sm text-brand mb-2">{pwMessage}</p>}
        {pwError && <p className="text-sm text-danger mb-2">{pwError}</p>}
        <form action={changePassword} className="flex flex-wrap gap-4 items-end">
          <label className="flex flex-col gap-1 text-sm">
            현재 비밀번호
            <input
              type="password"
              name="currentPassword"
              required
              className="rounded-md border border-ink/10 bg-bg px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            새 비밀번호
            <input
              type="password"
              name="newPassword"
              required
              minLength={6}
              className="rounded-md border border-ink/10 bg-bg px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-brand text-bg px-4 py-2 font-medium hover:opacity-90"
          >
            변경
          </button>
        </form>
      </section>
    </main>
  );
}

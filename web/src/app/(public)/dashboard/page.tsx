import { requireUser } from "@/lib/require-user";
import { createClient } from "@/lib/supabase/server";
import { totalRemainingAt } from "@/lib/caffeine";
import { changePassword } from "@/lib/auth-actions";
import Gauge from "@/components/dashboard/Gauge";
import { updateSettings } from "./actions";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export default async function DashboardPage({
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

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data: logs } = await supabase
    .from("user_drink_logs")
    .select("consumed_at, drinks(name_ko, drink_nutrition(caffeine_mg))")
    .eq("user_id", user.id)
    .gte("consumed_at", startOfToday.toISOString())
    .order("consumed_at", { ascending: true });

  const entries = (logs ?? [])
    .filter((log) => log.consumed_at !== null)
    .map((log) => ({
      caffeineMg: log.drinks?.drink_nutrition?.[0]?.caffeine_mg ?? 0,
      consumedAt: new Date(log.consumed_at as string),
    }));

  const todayIntake = entries.reduce((sum, e) => sum + e.caffeineMg, 0);
  const percentOfLimit = dailyLimit > 0 ? (todayIntake / dailyLimit) * 100 : 0;

  const now = new Date();
  const [bedHours, bedMinutes] = bedtime.split(":").map(Number);
  const bedtimeDate = new Date(now);
  bedtimeDate.setHours(bedHours, bedMinutes, 0, 0);
  if (bedtimeDate <= now) {
    bedtimeDate.setDate(bedtimeDate.getDate() + 1);
  }

  const remainingAtBedtime = totalRemainingAt(entries, bedtimeDate);

  return (
    <main className="flex-1 p-8 max-w-2xl mx-auto flex flex-col gap-8">
      <h1 className="font-display text-2xl font-bold">내 기록</h1>

      <section className="rounded-xl border border-ink/10 bg-brand-soft/10 p-6 flex flex-col items-center gap-2">
        <Gauge percent={percentOfLimit} />
        <p className="text-sm text-ink/60">오늘 섭취량</p>
        <p className="text-2xl font-bold tabular-nums">
          {todayIntake.toFixed(0)}mg{" "}
          <span className="text-base font-normal text-ink/60">/ {dailyLimit}mg</span>
        </p>
      </section>

      <section className="rounded-xl border border-ink/10 p-6">
        <p className="text-sm text-ink/60">
          취침 예정({formatTime(bedtimeDate)}) 예상 잔존 카페인
        </p>
        <p className="text-2xl font-bold tabular-nums">{remainingAtBedtime.toFixed(0)}mg</p>
      </section>

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

      <p className="text-xs text-ink/50 bg-brand-soft/20 rounded-md p-3">
        임신부, 청소년, 카페인에 민감하신 분들은 위 수치와 무관하게 섭취량을 더 낮게 조절하는
        것이 좋습니다. 이 정보는 일반적인 안내이며 의학적 진단이나 조언을 대신하지 않습니다.
      </p>
    </main>
  );
}

import Link from "next/link";
import { requireUser } from "@/lib/require-user";
import { createClient } from "@/lib/supabase/server";
import { totalRemainingAt } from "@/lib/caffeine";
import Gauge from "@/components/dashboard/Gauge";
import ResetTodayButton from "@/components/dashboard/ResetTodayButton";
import { resetTodayLogs } from "./actions";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const dailyLimit = settings?.daily_limit_mg ?? 400;
  const bedtime = settings?.bedtime ?? "23:00:00";

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data: logs } = await supabase
    .from("user_drink_logs")
    .select("id, consumed_at, drinks(name_ko, drink_nutrition(caffeine_mg))")
    .eq("user_id", user.id)
    .gte("consumed_at", startOfToday.toISOString())
    .order("consumed_at", { ascending: true });

  const todayLogs = (logs ?? [])
    .filter((log) => log.consumed_at !== null)
    .map((log) => ({
      id: log.id,
      name: log.drinks?.name_ko ?? "삭제된 음료",
      caffeineMg: log.drinks?.drink_nutrition?.[0]?.caffeine_mg ?? 0,
      consumedAt: new Date(log.consumed_at as string),
    }));

  const entries = todayLogs.map(({ caffeineMg, consumedAt }) => ({ caffeineMg, consumedAt }));

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

      <section className="rounded-xl border border-ink/10 p-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">오늘 마신 음료</h2>
          {todayLogs.length > 0 && <ResetTodayButton action={resetTodayLogs} />}
        </div>
        {todayLogs.length === 0 ? (
          <p className="text-sm text-ink/60">오늘 기록된 음료가 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {todayLogs.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between text-sm border-b border-ink/10 pb-2 last:border-0 last:pb-0"
              >
                <span>{log.name}</span>
                <span className="text-ink/60 tabular-nums">
                  {log.caffeineMg}mg · {formatTime(log.consumedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/account" className="text-sm text-brand underline w-fit">
        계정 설정 바로가기
      </Link>

      <p className="text-xs text-ink/50 bg-brand-soft/20 rounded-md p-3">
        임신부, 청소년, 카페인에 민감하신 분들은 위 수치와 무관하게 섭취량을 더 낮게 조절하는
        것이 좋습니다. 이 정보는 일반적인 안내이며 의학적 진단이나 조언을 대신하지 않습니다.
      </p>
    </main>
  );
}

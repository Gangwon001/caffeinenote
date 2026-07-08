"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeBedtimeDate,
  toDatetimeLocalValue,
  totalRemainingAt,
  type CaffeineEntry,
} from "@/lib/caffeine";

interface DrinkEntry {
  id: string;
  name: string;
  caffeineMg: number;
  consumedAt: string;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export default function CaffeineCalculator({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const [entries, setEntries] = useState<DrinkEntry[]>([]);
  const [bedtime, setBedtime] = useState("23:00");

  const [draftName, setDraftName] = useState("");
  const [draftCaffeine, setDraftCaffeine] = useState("");
  const [draftConsumedAt, setDraftConsumedAt] = useState(() => toDatetimeLocalValue(new Date()));

  function addEntry() {
    const caffeineMg = Number(draftCaffeine);
    if (!draftName.trim() || !caffeineMg || !draftConsumedAt) return;

    setEntries((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: draftName.trim(),
        caffeineMg,
        consumedAt: draftConsumedAt,
      },
    ]);
    setDraftName("");
    setDraftCaffeine("");
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const parsedEntries: CaffeineEntry[] = useMemo(
    () => entries.map((e) => ({ caffeineMg: e.caffeineMg, consumedAt: new Date(e.consumedAt) })),
    [entries],
  );

  const bedtimeDate = useMemo(
    () => computeBedtimeDate(parsedEntries, bedtime, now),
    [parsedEntries, bedtime, now],
  );

  const remainingAtBedtime = useMemo(
    () => totalRemainingAt(parsedEntries, bedtimeDate),
    [parsedEntries, bedtimeDate],
  );

  const timeline = useMemo(() => {
    if (parsedEntries.length === 0) return null;

    const earliest = new Date(Math.min(...parsedEntries.map((e) => e.consumedAt.getTime()), now.getTime()));
    const domainStart = earliest.getTime();
    const domainEnd = bedtimeDate.getTime();
    if (domainEnd <= domainStart) return null;

    const SAMPLES = 60;
    const curve = Array.from({ length: SAMPLES + 1 }, (_, i) => {
      const t = domainStart + ((domainEnd - domainStart) * i) / SAMPLES;
      return { t, value: totalRemainingAt(parsedEntries, new Date(t)) };
    });

    const maxValue = Math.max(...curve.map((p) => p.value), 1);
    const width = 720;
    const height = 180;
    const marginX = 40;
    const marginTop = 20;

    const x = (t: number) => marginX + ((t - domainStart) / (domainEnd - domainStart)) * width;
    const y = (v: number) => marginTop + height - (v / maxValue) * height;

    const path = curve
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)},${y(p.value).toFixed(1)}`)
      .join(" ");

    const dots = parsedEntries.map((e, i) => ({
      id: entries[i]?.id ?? String(i),
      cx: x(e.consumedAt.getTime()),
      cy: y(totalRemainingAt(parsedEntries, e.consumedAt)),
    }));

    return { path, dots, domainStart, domainEnd, width, height, marginTop };
  }, [parsedEntries, bedtimeDate, now, entries]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1 text-sm">
          음료 이름
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="아메리카노"
            className="rounded-md border border-brand-soft bg-bg px-3 py-2 w-40"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          카페인(mg)
          <input
            type="number"
            value={draftCaffeine}
            onChange={(e) => setDraftCaffeine(e.target.value)}
            placeholder="150"
            className="rounded-md border border-brand-soft bg-bg px-3 py-2 w-28"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          섭취 시각
          <input
            type="datetime-local"
            value={draftConsumedAt}
            onChange={(e) => setDraftConsumedAt(e.target.value)}
            className="rounded-md border border-brand-soft bg-bg px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={addEntry}
          className="rounded-md bg-brand text-bg px-4 py-2 font-medium hover:opacity-90"
        >
          음료 추가
        </button>
      </div>

      {entries.length > 0 && (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-md border border-brand-soft/60 px-3 py-2 text-sm"
            >
              <span>
                {entry.name} · {entry.caffeineMg}mg ·{" "}
                {formatTime(new Date(entry.consumedAt))}
              </span>
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                className="text-danger underline"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className="flex flex-col gap-1 text-sm max-w-[160px]">
        취침 예정 시각
        <input
          type="time"
          value={bedtime}
          onChange={(e) => setBedtime(e.target.value)}
          className="rounded-md border border-brand-soft bg-bg px-3 py-2"
        />
      </label>

      {entries.length === 0 ? (
        <p className="text-ink/60 text-sm">음료를 추가하면 취침 시각 기준 잔존 카페인을 계산해드려요.</p>
      ) : (
        <div className="rounded-xl border border-brand-soft bg-brand-soft/10 p-6 flex flex-col gap-4">
          <div>
            <p className="text-sm text-ink/60">취침 시각({formatTime(bedtimeDate)}) 예상 잔존 카페인</p>
            <p className="text-3xl font-bold tabular-nums">{remainingAtBedtime.toFixed(0)}mg</p>
          </div>

          {timeline && (
            <svg viewBox="0 0 800 240" className="w-full">
              <defs>
                <linearGradient id="caffeine-timeline-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--color-day)" />
                  <stop offset="100%" stopColor="var(--color-night)" />
                </linearGradient>
              </defs>
              <path
                d={timeline.path}
                fill="none"
                stroke="url(#caffeine-timeline-gradient)"
                strokeWidth={3}
                transform="translate(40, 0)"
              />
              {timeline.dots.map((dot) => (
                <circle
                  key={dot.id}
                  cx={dot.cx + 40}
                  cy={dot.cy}
                  r={5}
                  fill="var(--color-ink)"
                />
              ))}
              <text x={40} y={228} fontSize="12" fill="var(--color-ink)" opacity={0.6}>
                {formatTime(new Date(timeline.domainStart))}
              </text>
              <text
                x={timeline.width + 40}
                y={228}
                fontSize="12"
                fill="var(--color-ink)"
                opacity={0.6}
                textAnchor="end"
              >
                취침 {formatTime(new Date(timeline.domainEnd))}
              </text>
            </svg>
          )}

          <p className="text-xs text-ink/50">
            카페인 반감기를 약 5시간으로 가정한 추정치이며, 개인차가 있을 수 있습니다.
          </p>

          {isLoggedIn && (
            <button
              type="button"
              disabled
              title="다음 단계에서 연동 예정입니다"
              className="w-fit rounded-md bg-brand/50 text-bg px-4 py-2 font-medium cursor-not-allowed"
            >
              오늘 기록에 저장
            </button>
          )}
        </div>
      )}
    </div>
  );
}

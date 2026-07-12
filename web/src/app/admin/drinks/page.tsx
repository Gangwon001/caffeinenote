import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchAllRows } from "@/lib/supabase/fetch-all";
import { createDrink, deleteDrink } from "./actions";

const STALE_MS = 1000 * 60 * 60 * 24 * 30 * 6; // ~6 months

export default async function AdminDrinksPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: brands }, drinks] = await Promise.all([
    supabase.from("brands").select("id, name").order("name"),
    fetchAllRows((from, to) =>
      supabase
        .from("drinks")
        .select("*, brands(name), drink_nutrition(*)")
        .order("checked_at", { foreignTable: "drink_nutrition", ascending: true })
        .order("id")
        .range(from, to),
    ),
  ]);

  // Server Component: evaluated once per request, not subject to render purity concerns.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  return (
    <main className="flex-1 p-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold">메뉴 관리</h1>

      {error && <p className="text-sm text-danger">{error}</p>}

      <form action={createDrink} className="grid grid-cols-4 gap-3 max-w-4xl">
        <label className="flex flex-col gap-1 text-sm">
          브랜드
          <select name="brand_id" required className="rounded-md border px-3 py-2">
            {brands?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          메뉴명(한글)
          <input name="name_ko" required className="rounded-md border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          메뉴명(영문)
          <input name="name_en" className="rounded-md border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          slug
          <input name="slug" required className="rounded-md border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          사이즈
          <input name="size" placeholder="Tall / Grande" className="rounded-md border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          온도
          <select name="temperature" className="rounded-md border px-3 py-2">
            <option value="">-</option>
            <option value="hot">HOT</option>
            <option value="ice">ICE</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          카페인(mg)
          <input name="caffeine_mg" type="number" step="0.1" className="rounded-md border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          칼로리(kcal)
          <input name="calories_kcal" type="number" step="0.1" className="rounded-md border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          당류(g)
          <input name="sugar_g" type="number" step="0.1" className="rounded-md border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          나트륨(mg)
          <input name="sodium_mg" type="number" step="0.1" className="rounded-md border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          알러지 정보(쉼표 구분)
          <input name="allergens" placeholder="우유, 대두" className="rounded-md border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          출처 URL *
          <input name="source_url" type="url" required className="rounded-md border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          확인일 *
          <input name="checked_at" type="date" required className="rounded-md border px-3 py-2" />
        </label>
        <button
          type="submit"
          className="col-span-4 rounded-md bg-brand text-bg px-4 py-2 font-medium hover:opacity-90"
        >
          등록
        </button>
      </form>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 pr-4">브랜드</th>
            <th className="py-2 pr-4">메뉴명</th>
            <th className="py-2 pr-4">카페인</th>
            <th className="py-2 pr-4">확인일</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {drinks.map((drink) => {
            const nutrition = drink.drink_nutrition?.[0];
            const isStale =
              nutrition?.checked_at &&
              now - new Date(nutrition.checked_at).getTime() > STALE_MS;

            return (
              <tr key={drink.id} className={`border-b ${isStale ? "bg-danger/10" : ""}`}>
                <td className="py-2 pr-4">{drink.brands?.name}</td>
                <td className="py-2 pr-4">
                  {drink.name_ko} {drink.size} {drink.temperature}
                </td>
                <td className="py-2 pr-4 tabular-nums">{nutrition?.caffeine_mg ?? "-"}mg</td>
                <td className="py-2 pr-4">
                  {nutrition?.checked_at ?? "-"}
                  {isStale && (
                    <span className="ml-2 text-xs text-danger font-medium">
                      업데이트 필요
                    </span>
                  )}
                </td>
                <td className="py-2 pr-4 flex gap-3">
                  <Link href={`/admin/drinks/${drink.id}/edit`} className="text-brand underline">
                    수정
                  </Link>
                  <form action={deleteDrink.bind(null, drink.id)}>
                    <button type="submit" className="text-danger underline">
                      삭제
                    </button>
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}

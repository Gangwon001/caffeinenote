import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateDrink } from "../../actions";

export default async function EditDrinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: brands }, { data: drink }] = await Promise.all([
    supabase.from("brands").select("id, name").order("name"),
    supabase.from("drinks").select("*, drink_nutrition(*)").eq("id", id).maybeSingle(),
  ]);

  if (!drink) {
    notFound();
  }

  const nutrition = drink.drink_nutrition?.[0];
  const updateDrinkWithId = updateDrink.bind(null, id, nutrition?.id ?? "");

  return (
    <main className="flex-1 p-8">
      <h1 className="text-2xl font-bold">메뉴 수정</h1>

      {error && <p className="text-sm text-danger mt-2">{error}</p>}

      <form action={updateDrinkWithId} className="grid grid-cols-4 gap-3 max-w-4xl mt-6">
        <label className="flex flex-col gap-1 text-sm">
          브랜드
          <select
            name="brand_id"
            required
            defaultValue={drink.brand_id ?? ""}
            className="rounded-md border px-3 py-2"
          >
            {brands?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          메뉴명(한글)
          <input
            name="name_ko"
            required
            defaultValue={drink.name_ko}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          메뉴명(영문)
          <input
            name="name_en"
            defaultValue={drink.name_en ?? ""}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          slug
          <input
            name="slug"
            required
            defaultValue={drink.slug}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          사이즈
          <input
            name="size"
            defaultValue={drink.size ?? ""}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          온도
          <select
            name="temperature"
            defaultValue={drink.temperature ?? ""}
            className="rounded-md border px-3 py-2"
          >
            <option value="">-</option>
            <option value="hot">HOT</option>
            <option value="ice">ICE</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          카페인(mg)
          <input
            name="caffeine_mg"
            type="number"
            step="0.1"
            defaultValue={nutrition?.caffeine_mg ?? ""}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          칼로리(kcal)
          <input
            name="calories_kcal"
            type="number"
            step="0.1"
            defaultValue={nutrition?.calories_kcal ?? ""}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          당류(g)
          <input
            name="sugar_g"
            type="number"
            step="0.1"
            defaultValue={nutrition?.sugar_g ?? ""}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          나트륨(mg)
          <input
            name="sodium_mg"
            type="number"
            step="0.1"
            defaultValue={nutrition?.sodium_mg ?? ""}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          알러지 정보(쉼표 구분)
          <input
            name="allergens"
            defaultValue={nutrition?.allergens?.join(", ") ?? ""}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          출처 URL *
          <input
            name="source_url"
            type="url"
            required
            defaultValue={nutrition?.source_url ?? ""}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          확인일 *
          <input
            name="checked_at"
            type="date"
            required
            defaultValue={nutrition?.checked_at ?? ""}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="col-span-4 rounded-md bg-brand text-bg px-4 py-2 font-medium hover:opacity-90"
        >
          저장
        </button>
      </form>
    </main>
  );
}

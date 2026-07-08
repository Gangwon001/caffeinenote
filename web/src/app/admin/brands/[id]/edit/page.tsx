import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateBrand } from "../../actions";

export default async function EditBrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: brand } = await supabase.from("brands").select("*").eq("id", id).maybeSingle();

  if (!brand) {
    notFound();
  }

  const updateBrandWithId = updateBrand.bind(null, id);

  return (
    <main className="flex-1 p-8">
      <h1 className="text-2xl font-bold">브랜드 수정</h1>

      {error && <p className="text-sm text-danger mt-2">{error}</p>}

      <form action={updateBrandWithId} className="flex flex-col gap-4 max-w-sm mt-6">
        <label className="flex flex-col gap-1 text-sm">
          브랜드명
          <input
            name="name"
            required
            defaultValue={brand.name}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          slug
          <input
            name="slug"
            required
            defaultValue={brand.slug}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          로고 URL
          <input
            name="logo_url"
            defaultValue={brand.logo_url ?? ""}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-brand text-bg px-4 py-2 font-medium hover:opacity-90"
        >
          저장
        </button>
      </form>
    </main>
  );
}

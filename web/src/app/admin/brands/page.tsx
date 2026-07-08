import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createBrand, deleteBrand } from "./actions";

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 p-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold">브랜드 관리</h1>

      {error && <p className="text-sm text-danger">{error}</p>}

      <form action={createBrand} className="flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1 text-sm">
          브랜드명
          <input name="name" required className="rounded-md border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          slug
          <input name="slug" required className="rounded-md border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          로고 URL
          <input name="logo_url" className="rounded-md border px-3 py-2" />
        </label>
        <button
          type="submit"
          className="rounded-md bg-brand text-bg px-4 py-2 font-medium hover:opacity-90"
        >
          등록
        </button>
      </form>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 pr-4">브랜드명</th>
            <th className="py-2 pr-4">slug</th>
            <th className="py-2 pr-4">로고</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {brands?.map((brand) => (
            <tr key={brand.id} className="border-b">
              <td className="py-2 pr-4">{brand.name}</td>
              <td className="py-2 pr-4">{brand.slug}</td>
              <td className="py-2 pr-4">{brand.logo_url ?? "-"}</td>
              <td className="py-2 pr-4 flex gap-3">
                <Link href={`/admin/brands/${brand.id}/edit`} className="text-brand underline">
                  수정
                </Link>
                <form action={deleteBrand.bind(null, brand.id)}>
                  <button type="submit" className="text-danger underline">
                    삭제
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;
  return (
    <main className="flex-1 p-8">
      <h1 className="font-display text-2xl font-bold">브랜드: {brand}</h1>
      <p className="text-ink/70 mt-2">Phase 5에서 구현 예정</p>
    </main>
  );
}

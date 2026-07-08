export default async function DrinkDetailPage({
  params,
}: {
  params: Promise<{ brand: string; slug: string }>;
}) {
  const { brand, slug } = await params;
  return (
    <main className="flex-1 p-8">
      <h1 className="font-display text-2xl font-bold">
        메뉴 상세: {brand} / {slug}
      </h1>
      <p className="text-ink/70 mt-2">Phase 5에서 구현 예정</p>
    </main>
  );
}

export default async function DrinksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <main className="flex-1 p-8">
      <h1 className="font-display text-2xl font-bold">음료 검색</h1>
      {q ? (
        <p className="text-ink/70 mt-2">&quot;{q}&quot; 검색 결과 — Phase 5에서 구현 예정</p>
      ) : (
        <p className="text-ink/70 mt-2">Phase 5에서 구현 예정</p>
      )}
    </main>
  );
}

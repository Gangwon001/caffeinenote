export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="flex-1 p-8">
      <h1 className="font-display text-2xl font-bold">글: {slug}</h1>
      <p className="text-ink/70 mt-2">Phase 8에서 구현 예정</p>
    </main>
  );
}

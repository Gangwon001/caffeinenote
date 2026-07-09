import TiptapEditor from "@/components/admin/TiptapEditor";
import { BLOG_CATEGORIES } from "@/lib/blog-categories";
import { createPost } from "../actions";

export default async function NewBlogPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex-1 p-8">
      <h1 className="text-2xl font-bold">새 글 작성</h1>

      {error && <p className="text-sm text-danger mt-2">{error}</p>}

      <form action={createPost} className="flex flex-col gap-4 max-w-3xl mt-6">
        <label className="flex flex-col gap-1 text-sm">
          제목
          <input name="title" required className="rounded-md border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          slug
          <input name="slug" required className="rounded-md border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          상태
          <select name="status" defaultValue="draft" className="rounded-md border px-3 py-2 w-40">
            <option value="draft">초안</option>
            <option value="published">발행</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          카테고리
          <select name="category" defaultValue="" className="rounded-md border px-3 py-2 w-40">
            <option value="">없음</option>
            {BLOG_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          본문
          <TiptapEditor name="content" />
        </label>
        <button
          type="submit"
          className="rounded-md bg-brand text-bg px-4 py-2 font-medium hover:opacity-90 w-fit"
        >
          저장
        </button>
      </form>
    </main>
  );
}

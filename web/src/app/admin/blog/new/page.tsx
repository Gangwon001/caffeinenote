import TiptapEditor from "@/components/admin/TiptapEditor";
import CoverImageInput from "@/components/admin/CoverImageInput";
import { BLOG_CATEGORIES } from "@/lib/blog-categories";
import { createPost } from "../actions";

export default async function NewBlogPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const draftId = crypto.randomUUID();
  const createDraft = createPost.bind(null, "draft");
  const createPublished = createPost.bind(null, "published");

  return (
    <main className="flex-1 p-8">
      <h1 className="text-2xl font-bold">새 글 작성</h1>

      {error && <p className="text-sm text-danger mt-2">{error}</p>}

      <form className="flex flex-col gap-4 max-w-3xl mt-6">
        <label className="flex flex-col gap-1 text-sm">
          제목
          <input name="title" required className="rounded-md border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          slug
          <input name="slug" required className="rounded-md border px-3 py-2" />
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
          요약(excerpt)
          <textarea
            name="excerpt"
            rows={2}
            placeholder="비워두면 본문에서 자동으로 생성됩니다."
            className="rounded-md border px-3 py-2"
          />
        </label>
        {/*
          Plain div, not <label>: wrapping a multi-control widget in <label>
          makes the browser redirect any click inside it (even on the
          contenteditable body) to the label's first labelable descendant,
          stealing focus away from whatever was actually clicked.
        */}
        <div className="flex flex-col gap-1 text-sm">
          <span>커버 이미지</span>
          <CoverImageInput name="cover_image_url" folderId={draftId} />
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <span>본문</span>
          <TiptapEditor name="content" folderId={draftId} />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            formAction={createDraft}
            className="rounded-md border border-brand text-brand px-4 py-2 font-medium hover:bg-brand-soft w-fit"
          >
            임시저장
          </button>
          <button
            type="submit"
            formAction={createPublished}
            className="rounded-md bg-brand text-bg px-4 py-2 font-medium hover:opacity-90 w-fit"
          >
            발행하기
          </button>
        </div>
      </form>
    </main>
  );
}

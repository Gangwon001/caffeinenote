import { notFound } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import TiptapEditor from "@/components/admin/TiptapEditor";
import CoverImageInput from "@/components/admin/CoverImageInput";
import { createClient } from "@/lib/supabase/server";
import { BLOG_CATEGORIES } from "@/lib/blog-categories";
import { updatePost } from "../../actions";

export default async function EditBlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();

  if (!post) {
    notFound();
  }

  const updateDraft = updatePost.bind(null, id, "draft");
  const updatePublished = updatePost.bind(null, id, "published");

  return (
    <main className="flex-1 p-8">
      <h1 className="text-2xl font-bold">글 수정</h1>

      {error && <p className="text-sm text-danger mt-2">{error}</p>}

      <form className="flex flex-col gap-4 max-w-3xl mt-6">
        <label className="flex flex-col gap-1 text-sm">
          제목
          <input
            name="title"
            required
            defaultValue={post.title}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          slug
          <input
            name="slug"
            required
            defaultValue={post.slug}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          카테고리
          <select
            name="category"
            defaultValue={post.category ?? ""}
            className="rounded-md border px-3 py-2 w-40"
          >
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
            defaultValue={post.excerpt ?? ""}
            placeholder="비워두면 본문에서 자동으로 생성됩니다."
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          커버 이미지
          <CoverImageInput
            name="cover_image_url"
            defaultValue={post.cover_image_url}
            folderId={post.id}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          본문
          <TiptapEditor
            name="content"
            initialContent={post.content as JSONContent}
            folderId={post.id}
          />
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            formAction={updateDraft}
            className="rounded-md border border-brand text-brand px-4 py-2 font-medium hover:bg-brand-soft w-fit"
          >
            임시저장
          </button>
          <button
            type="submit"
            formAction={updatePublished}
            className="rounded-md bg-brand text-bg px-4 py-2 font-medium hover:opacity-90 w-fit"
          >
            발행하기
          </button>
        </div>
      </form>
    </main>
  );
}

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
          요약(excerpt) — 발행 시 필수
          <textarea
            name="excerpt"
            rows={2}
            required
            defaultValue={post.excerpt ?? ""}
            placeholder="목록/카드에 표시될 요약을 입력하세요. 본문과 다른 문장으로 작성해주세요."
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
          <span>목록용 썸네일</span>
          <p className="text-xs text-ink/50">
            목록/카드에는 이 이미지가 우선 표시됩니다. 등록하지 않으면 커버 이미지를 대신
            사용하는데, 커버 이미지는 텍스트가 많은 인포그래픽일 수 있어 작게 축소하면
            뭉개질 수 있습니다. 목록용 썸네일을 별도로 등록하는 것을 권장합니다.
          </p>
          <CoverImageInput
            name="list_thumbnail_url"
            defaultValue={post.list_thumbnail_url}
            folderId={post.id}
          />
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <span>커버 이미지</span>
          <CoverImageInput
            name="cover_image_url"
            defaultValue={post.cover_image_url}
            folderId={post.id}
          />
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <span>본문</span>
          <TiptapEditor
            name="content"
            initialContent={post.content as JSONContent}
            folderId={post.id}
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            formAction={updateDraft}
            formNoValidate
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

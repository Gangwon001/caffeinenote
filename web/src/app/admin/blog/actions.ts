"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { extractTiptapExcerpt } from "@/lib/tiptap-html";

export async function createPost(status: "draft" | "published", formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const category = (formData.get("category") as string) || null;
  const cover_image_url = (formData.get("cover_image_url") as string) || null;
  const list_thumbnail_url = (formData.get("list_thumbnail_url") as string) || null;
  const content = JSON.parse((formData.get("content") as string) || "{}");
  const excerptInput = (formData.get("excerpt") as string).trim();

  // A missing excerpt silently falls back to auto-extracted body text, which
  // usually just repeats the title as the first line — require a real
  // human-written excerpt before a post can go live (drafts are exempt).
  if (status === "published" && !excerptInput) {
    redirect(
      `/admin/blog/new?error=${encodeURIComponent("발행하려면 요약(excerpt)을 입력해야 합니다.")}`,
    );
  }
  const excerpt = excerptInput || extractTiptapExcerpt(content);

  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").insert({
    title,
    slug,
    status,
    category,
    cover_image_url,
    list_thumbnail_url,
    excerpt,
    content,
    published_at: status === "published" ? new Date().toISOString() : null,
  });

  if (error) {
    redirect(`/admin/blog/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function updatePost(
  id: string,
  status: "draft" | "published",
  formData: FormData,
) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const category = (formData.get("category") as string) || null;
  const cover_image_url = (formData.get("cover_image_url") as string) || null;
  const list_thumbnail_url = (formData.get("list_thumbnail_url") as string) || null;
  const content = JSON.parse((formData.get("content") as string) || "{}");
  const excerptInput = (formData.get("excerpt") as string).trim();

  if (status === "published" && !excerptInput) {
    redirect(
      `/admin/blog/${id}/edit?error=${encodeURIComponent("발행하려면 요약(excerpt)을 입력해야 합니다.")}`,
    );
  }
  const excerpt = excerptInput || extractTiptapExcerpt(content);

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title,
      slug,
      status,
      category,
      cover_image_url,
      list_thumbnail_url,
      excerpt,
      content,
      updated_at: new Date().toISOString(),
      published_at:
        status === "published" ? existing?.published_at ?? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/blog/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  await supabase.from("blog_posts").delete().eq("id", id);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

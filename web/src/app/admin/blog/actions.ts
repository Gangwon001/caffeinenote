"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const status = formData.get("status") as string;
  const category = (formData.get("category") as string) || null;
  const content = JSON.parse((formData.get("content") as string) || "{}");

  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").insert({
    title,
    slug,
    status,
    category,
    content,
    published_at: status === "published" ? new Date().toISOString() : null,
  });

  if (error) {
    redirect(`/admin/blog/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function updatePost(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const status = formData.get("status") as string;
  const category = (formData.get("category") as string) || null;
  const content = JSON.parse((formData.get("content") as string) || "{}");

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

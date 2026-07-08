"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createBrand(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const logo_url = (formData.get("logo_url") as string) || null;

  const supabase = await createClient();
  const { error } = await supabase.from("brands").insert({ name, slug, logo_url });

  if (error) {
    redirect(`/admin/brands?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

export async function updateBrand(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const logo_url = (formData.get("logo_url") as string) || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("brands")
    .update({ name, slug, logo_url })
    .eq("id", id);

  if (error) {
    redirect(`/admin/brands/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

export async function deleteBrand(id: string) {
  const supabase = await createClient();
  await supabase.from("brands").delete().eq("id", id);
  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

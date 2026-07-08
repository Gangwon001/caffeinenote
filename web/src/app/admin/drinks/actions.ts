"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function parseNutritionFields(formData: FormData) {
  const source_url = formData.get("source_url") as string;
  const checked_at = formData.get("checked_at") as string;

  if (!source_url || !checked_at) {
    return { error: "source_url과 checked_at은 필수 입력 항목입니다." };
  }

  const allergensRaw = (formData.get("allergens") as string) || "";
  const allergens = allergensRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    fields: {
      caffeine_mg: formData.get("caffeine_mg") ? Number(formData.get("caffeine_mg")) : null,
      calories_kcal: formData.get("calories_kcal") ? Number(formData.get("calories_kcal")) : null,
      sugar_g: formData.get("sugar_g") ? Number(formData.get("sugar_g")) : null,
      sodium_mg: formData.get("sodium_mg") ? Number(formData.get("sodium_mg")) : null,
      allergens,
      source_url,
      checked_at,
    },
  };
}

export async function createDrink(formData: FormData) {
  const parsed = parseNutritionFields(formData);
  if (parsed.error) {
    redirect(`/admin/drinks?error=${encodeURIComponent(parsed.error)}`);
  }

  const supabase = await createClient();

  const { data: drink, error: drinkError } = await supabase
    .from("drinks")
    .insert({
      brand_id: formData.get("brand_id") as string,
      name_ko: formData.get("name_ko") as string,
      name_en: (formData.get("name_en") as string) || null,
      slug: formData.get("slug") as string,
      size: (formData.get("size") as string) || null,
      temperature: (formData.get("temperature") as string) || null,
    })
    .select()
    .single();

  if (drinkError || !drink) {
    redirect(`/admin/drinks?error=${encodeURIComponent(drinkError?.message ?? "메뉴 등록 실패")}`);
  }

  const { error: nutritionError } = await supabase
    .from("drink_nutrition")
    .insert({ drink_id: drink!.id, ...parsed.fields! });

  if (nutritionError) {
    redirect(`/admin/drinks?error=${encodeURIComponent(nutritionError.message)}`);
  }

  revalidatePath("/admin/drinks");
  redirect("/admin/drinks");
}

export async function updateDrink(id: string, nutritionId: string, formData: FormData) {
  const parsed = parseNutritionFields(formData);
  if (parsed.error) {
    redirect(`/admin/drinks/${id}/edit?error=${encodeURIComponent(parsed.error)}`);
  }

  const supabase = await createClient();

  const { error: drinkError } = await supabase
    .from("drinks")
    .update({
      brand_id: formData.get("brand_id") as string,
      name_ko: formData.get("name_ko") as string,
      name_en: (formData.get("name_en") as string) || null,
      slug: formData.get("slug") as string,
      size: (formData.get("size") as string) || null,
      temperature: (formData.get("temperature") as string) || null,
    })
    .eq("id", id);

  if (drinkError) {
    redirect(`/admin/drinks/${id}/edit?error=${encodeURIComponent(drinkError.message)}`);
  }

  const { error: nutritionError } = await supabase
    .from("drink_nutrition")
    .update(parsed.fields!)
    .eq("id", nutritionId);

  if (nutritionError) {
    redirect(`/admin/drinks/${id}/edit?error=${encodeURIComponent(nutritionError.message)}`);
  }

  revalidatePath("/admin/drinks");
  redirect("/admin/drinks");
}

export async function deleteDrink(id: string) {
  const supabase = await createClient();
  await supabase.from("drink_nutrition").delete().eq("drink_id", id);
  await supabase.from("drinks").delete().eq("id", id);
  revalidatePath("/admin/drinks");
  redirect("/admin/drinks");
}

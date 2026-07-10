"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const daily_limit_mg = Number(formData.get("daily_limit_mg"));
  const bedtime = formData.get("bedtime") as string;
  const sensitivity = formData.get("sensitivity") as string;

  await supabase.from("user_settings").upsert({
    user_id: user.id,
    daily_limit_mg,
    bedtime,
    sensitivity,
  });

  revalidatePath("/account");
}

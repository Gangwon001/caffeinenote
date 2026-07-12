"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function resetTodayLogs() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  await supabase
    .from("user_drink_logs")
    .delete()
    .eq("user_id", user.id)
    .gte("consumed_at", startOfToday.toISOString());

  revalidatePath("/dashboard");
}

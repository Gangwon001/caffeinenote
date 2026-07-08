"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveTodayLogs(entries: { drinkId: string; consumedAt: string }[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }
  if (entries.length === 0) {
    return;
  }

  const rows = entries.map((entry) => ({
    user_id: user.id,
    drink_id: entry.drinkId,
    consumed_at: new Date(entry.consumedAt).toISOString(),
  }));

  const { error } = await supabase.from("user_drink_logs").insert(rows);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}

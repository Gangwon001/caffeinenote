import { createClient } from "@/lib/supabase/server";
import CaffeineCalculator from "@/components/calculator/CaffeineCalculator";

export default async function CaffeineCalculatorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex-1 p-8 max-w-2xl mx-auto flex flex-col gap-2">
      <h1 className="font-display text-2xl font-bold">카페인 계산기</h1>
      <p className="text-ink/70 mb-4">
        마신 음료와 취침 예정 시각을 입력하면, 취침 시각 기준 잔존 카페인을 계산해드려요.
      </p>
      <CaffeineCalculator isLoggedIn={Boolean(user)} />
    </main>
  );
}

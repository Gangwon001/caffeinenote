import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resetPassword } from "@/lib/auth-actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/forgot-password?error=${encodeURIComponent("링크가 만료되었어요. 비밀번호 재설정을 다시 요청해주세요.")}`,
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <form
        action={resetPassword}
        className="w-full max-w-sm flex flex-col gap-4 bg-brand-soft/30 border border-ink/10 rounded-xl p-6"
      >
        <h1 className="font-display text-2xl font-bold">비밀번호 재설정</h1>
        <p className="text-sm text-ink/70">새로 사용할 비밀번호를 입력해주세요.</p>

        {error && <p className="text-sm text-danger">{error}</p>}

        <label className="flex flex-col gap-1 text-sm">
          새 비밀번호
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="rounded-md border border-ink/10 bg-bg px-3 py-2"
          />
        </label>

        <button type="submit" className="rounded-md bg-brand text-bg py-2 font-medium hover:opacity-90">
          비밀번호 변경
        </button>
      </form>
    </main>
  );
}

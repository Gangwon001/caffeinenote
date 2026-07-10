import Link from "next/link";
import { findAccount } from "@/lib/auth-actions";

export default async function FindAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <form
        action={findAccount}
        className="w-full max-w-sm flex flex-col gap-4 bg-brand-soft/30 border border-ink/10 rounded-xl p-6"
      >
        <h1 className="font-display text-2xl font-bold">아이디 찾기</h1>
        <p className="text-sm text-ink/70">
          카페인노트는 이메일 주소가 곧 아이디예요. 가입 시 사용한 이메일을 입력하면 가입 여부를 확인해드려요.
        </p>

        {message && <p className="text-sm text-brand">{message}</p>}
        {error && <p className="text-sm text-danger">{error}</p>}

        <label className="flex flex-col gap-1 text-sm">
          이메일
          <input type="email" name="email" required className="rounded-md border border-ink/10 bg-bg px-3 py-2" />
        </label>

        <button type="submit" className="rounded-md bg-brand text-bg py-2 font-medium hover:opacity-90">
          확인
        </button>

        <p className="text-sm text-ink/70">
          비밀번호를 잊으셨나요? <Link href="/forgot-password" className="text-brand underline">비밀번호 찾기</Link>
        </p>
        <p className="text-sm text-ink/70">
          <Link href="/login" className="text-brand underline">로그인으로 돌아가기</Link>
        </p>
      </form>
    </main>
  );
}

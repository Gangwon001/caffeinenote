import Link from "next/link";
import { signup } from "@/lib/auth-actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <form
        action={signup}
        className="w-full max-w-sm flex flex-col gap-4 bg-brand-soft/30 border border-ink/10 rounded-xl p-6"
      >
        <h1 className="font-display text-2xl font-bold">회원가입</h1>

        {error && <p className="text-sm text-danger">{error}</p>}

        <label className="flex flex-col gap-1 text-sm">
          이메일
          <input
            type="email"
            name="email"
            required
            className="rounded-md border border-ink/10 bg-bg px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          비밀번호 (6자 이상)
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="rounded-md border border-ink/10 bg-bg px-3 py-2"
          />
        </label>

        <button
          type="submit"
          className="rounded-md bg-brand text-bg py-2 font-medium hover:opacity-90"
        >
          회원가입
        </button>

        <p className="text-sm text-ink/70">
          이미 계정이 있으신가요? <Link href="/login" className="text-brand underline">로그인</Link>
        </p>
      </form>
    </main>
  );
}

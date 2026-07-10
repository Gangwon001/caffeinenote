import Link from "next/link";
import { login } from "@/lib/auth-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <form
        action={login}
        className="w-full max-w-sm flex flex-col gap-4 bg-brand-soft/30 border border-ink/10 rounded-xl p-6"
      >
        <h1 className="font-display text-2xl font-bold">로그인</h1>

        {message && <p className="text-sm text-brand">{message}</p>}
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
          비밀번호
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
          로그인
        </button>

        <p className="text-sm text-ink/70 flex gap-3">
          <Link href="/find-account" className="text-brand underline">아이디 찾기</Link>
          <Link href="/forgot-password" className="text-brand underline">비밀번호 찾기</Link>
        </p>

        <p className="text-sm text-ink/70">
          계정이 없으신가요? <Link href="/signup" className="text-brand underline">회원가입</Link>
        </p>
      </form>
    </main>
  );
}

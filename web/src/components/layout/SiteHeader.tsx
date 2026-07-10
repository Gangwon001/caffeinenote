import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/auth-actions";
import { CupIcon } from "@/components/icons";

const NAV_LINKS = [
  { href: "/drinks", label: "음료 검색" },
  { href: "/calculator/caffeine", label: "수면 계산" },
  { href: "/blog", label: "블로그" },
  { href: "/dashboard", label: "내 기록" },
];

export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    isAdmin = roleRow?.role === "admin";
  }

  const authControls = user ? (
    <form action={logout}>
      <button type="submit" className="text-sm font-medium hover:text-brand">
        로그아웃
      </button>
    </form>
  ) : (
    <div className="flex items-center gap-3">
      <Link href="/login" className="text-sm font-medium hover:text-brand">
        로그인
      </Link>
      <Link
        href="/signup"
        className="rounded-full bg-brand text-bg px-4 py-1.5 text-sm font-medium hover:opacity-90"
      >
        회원가입
      </Link>
    </div>
  );

  return (
    <header className="border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="font-display text-lg font-bold text-brand flex items-center gap-2">
            <CupIcon className="w-6 h-6" />
            카페인노트
          </Link>
          <div className="md:hidden">{authControls}</div>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brand">
              {link.label}
            </Link>
          ))}
          {user && (
            <Link href="/account" className="hover:text-brand">
              계정 설정
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="text-brand hover:underline">
              관리자
            </Link>
          )}
        </nav>

        <div className="hidden md:block">{authControls}</div>
      </div>
    </header>
  );
}

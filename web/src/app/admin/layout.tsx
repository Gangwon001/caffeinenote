import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { logout } from "@/lib/auth-actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex-1 flex flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <nav className="flex gap-4 text-sm font-medium">
          <Link href="/admin">대시보드</Link>
          <Link href="/admin/brands">브랜드</Link>
          <Link href="/admin/drinks">메뉴</Link>
          <Link href="/admin/blog">블로그</Link>
          <Link href="/admin/members">회원</Link>
        </nav>
        <form action={logout}>
          <button type="submit" className="text-sm text-ink/60 hover:text-ink">
            로그아웃
          </button>
        </form>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}

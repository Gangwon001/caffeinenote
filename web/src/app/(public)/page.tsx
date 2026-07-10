import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HeroIllustration from "@/components/home/HeroIllustration";
import {
  CupIcon,
  MoonIcon,
  ClipboardIcon,
  BookIcon,
  SearchIcon,
  ChevronIcon,
} from "@/components/icons";

const POPULAR_QUERIES = ["아메리카노", "라떼", "바닐라 라떼", "녹차", "디카페인", "콜드브루"];

const FEATURE_CARDS = [
  {
    href: "/drinks",
    title: "카페인·당류·칼로리 검색",
    description: "브랜드별 음료의 카페인, 당류, 칼로리 정보를 빠르게 확인하세요.",
    Icon: CupIcon,
    iconBg: "#E8F4EC",
    iconColor: "#0F5B3A",
  },
  {
    href: "/calculator/caffeine",
    title: "수면 계산",
    description: "취침 시간을 기준으로 잔존 카페인을 계산하고, 수면에 미치는 영향을 확인해보세요.",
    Icon: MoonIcon,
    iconBg: "#EDE9FB",
    iconColor: "#8B7FE0",
  },
  {
    href: "/dashboard",
    title: "내 기록",
    description: "오늘 마신 음료를 기록하고 하루 적정량 대비 누적 섭취량을 관리해보세요.",
    Icon: ClipboardIcon,
    iconBg: "#E3EEFC",
    iconColor: "#4F8FDA",
  },
  {
    href: "/blog",
    title: "블로그",
    description: "수면, 카페인, 건강 정보와 숙면을 위한 팁을 확인해보세요.",
    Icon: BookIcon,
    iconBg: "#FBEADF",
    iconColor: "#D98A4B",
  },
];

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: posts }, { data: brands }, { data: drinks }] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("id, title, slug, published_at, cover_image_url")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(4),
    supabase.from("brands").select("name, slug").order("name"),
    supabase.from("drinks").select("size"),
  ]);

  const sizes = Array.from(
    new Set((drinks ?? []).map((d) => d.size).filter((size): size is string => Boolean(size))),
  );

  return (
    <main className="flex-1">
      <section className="bg-brand-soft/60">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col-reverse sm:flex-row items-center gap-10">
          <div className="flex flex-col items-start gap-6 flex-1">
            <h1 className="font-display text-3xl sm:text-4xl font-bold max-w-xl">
              오늘 마신 커피,
              <br />
              밤에 <span className="text-brand">잠을</span> 방해할까요?
            </h1>
            <p className="text-ink/70 max-w-md">
              카페인·당류·칼로리 정보를 확인하고
              <br />
              취침 전 잔존 카페인을 계산해보세요.
            </p>

            <form
              action="/drinks"
              className="w-full flex flex-wrap items-end gap-2 bg-bg border border-ink/10 rounded-xl p-4"
            >
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="flex items-center gap-1.5 text-ink/70">
                  <CupIcon className="w-4 h-4" /> 브랜드
                </span>
                <select
                  name="brand"
                  defaultValue=""
                  className="rounded-md border border-ink/15 bg-bg px-3 py-2 text-sm"
                >
                  <option value="">전체 브랜드</option>
                  {(brands ?? []).map((b) => (
                    <option key={b.slug} value={b.slug}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>

              <ChevronIcon className="w-4 h-4 text-ink/30 mb-2.5" />

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="flex items-center gap-1.5 text-ink/70">
                  <CupIcon className="w-4 h-4" /> 사이즈
                </span>
                <select
                  name="size"
                  defaultValue=""
                  className="rounded-md border border-ink/15 bg-bg px-3 py-2 text-sm"
                >
                  <option value="">전체 사이즈</option>
                  {sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              <ChevronIcon className="w-4 h-4 text-ink/30 mb-2.5" />

              <label className="flex-1 min-w-[200px] flex flex-col gap-1.5 text-sm">
                <span className="flex items-center gap-1.5 text-ink/70">
                  <MoonIcon className="w-4 h-4" /> 메뉴 검색
                </span>
                <div className="flex gap-2">
                  <input
                    type="search"
                    name="q"
                    placeholder="메뉴명을 입력하세요"
                    className="flex-1 rounded-md border border-ink/15 bg-bg px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    aria-label="검색"
                    className="rounded-md bg-brand text-bg px-4 py-2 hover:opacity-90"
                  >
                    <SearchIcon className="w-4 h-4" />
                  </button>
                </div>
              </label>
            </form>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-ink/50 self-center">인기 검색어:</span>
              {POPULAR_QUERIES.map((q) => (
                <Link
                  key={q}
                  href={`/drinks?q=${encodeURIComponent(q)}`}
                  className="rounded-full bg-bg border border-ink/10 px-4 py-1.5 text-sm hover:bg-brand-soft"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>

          <HeroIllustration />
        </div>
      </section>

      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURE_CARDS.map(({ href, title, description, Icon, iconBg, iconColor }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl border border-ink/10 bg-bg p-6 flex items-center gap-4 hover:shadow-sm transition-shadow"
            >
              <div
                className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: iconBg, color: iconColor }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg font-bold">{title}</h2>
                <p className="text-ink/70 text-sm mt-1">{description}</p>
              </div>
              <ChevronIcon className="w-4 h-4 text-ink/30 shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {posts && posts.length > 0 && (
        <section className="px-6 py-12 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">최신 글</h2>
            <Link
              href="/blog"
              className="text-sm text-brand underline flex items-center gap-1"
            >
              전체 글 보기 <ChevronIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="rounded-lg border border-ink/10 overflow-hidden hover:shadow-sm transition-shadow"
              >
                {post.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.cover_image_url}
                    alt=""
                    className="h-24 w-full object-cover"
                  />
                ) : (
                  <div className="h-24 bg-brand-soft flex items-center justify-center text-brand/60">
                    <BookIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-medium line-clamp-2">{post.title}</p>
                  <p className="text-xs text-ink/50 mt-2">{formatDate(post.published_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

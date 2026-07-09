# 카페인노트 (CaffeineNote) — 클로드 코드 실행 프롬프트

> 사이트명: **카페인노트** / 영문: **CaffeineNote** / 도메인 후보: caffeinenote.com (또는 .co.kr)
> 브랜드 톤: "노트"라는 이름처럼, 하루 카페인 섭취를 기록하고 확인하는 다이어리 느낌을 로고/카피에 살짝 반영할 것.

> 사용법: 이 문서 전체를 프로젝트 루트에 `CLAUDE.md`로 저장한 뒤,
> 클로드 코드에서 "PHASE 0부터 시작해줘"라고 지시하세요.
> 한 번에 전부 시키지 말고, 각 Phase가 끝날 때마다 결과를 확인한 뒤 다음 Phase로 넘어가세요.

---

## 0. 제품 한 줄 정의

카페 음료의 카페인·칼로리·당류를 검색하고, 취침 시간 기준 잔존 카페인을 계산해
"오늘 마신 커피가 밤잠을 방해할지"를 알려주는 SEO 우선 웹 서비스.
비회원은 검색·계산기 전 기능 무료, 회원가입은 "저장·통계·개인화" 시점에만 유도한다.

**핵심 UX 원칙 (타협 불가)**
- 검색과 계산기는 절대 로그인으로 막지 않는다.
- 로그인 유도는 "오늘 마신 음료 저장하기" 버튼 클릭 시점에만 자연스럽게 등장한다.
- 모든 수치 정보(카페인/칼로리/당류)는 출처(`source_url`)와 확인일(`checked_at`)을 반드시 함께 표기한다.

---

## 1. 기술 스택

- **프레임워크**: Next.js (App Router), TypeScript
- **스타일**: Tailwind CSS
- **DB/Auth**: Supabase (Postgres + Auth)
- **배포**: Vercel
- **PWA**: manifest + service worker (홈 화면 추가)
- 확장 계획(지금은 만들지 않음): 트래픽 확인 후 React Native 앱으로 별도 확장

---

## 2. 정보구조 (사이트맵)

| 경로 | 역할 | 인증 |
|---|---|---|
| `/` | 홈: 검색 히어로, 인기 브랜드, 계산기 진입, 최신 글 | 비회원 |
| `/drinks` | 전체 음료 검색 (브랜드/사이즈/카페인/칼로리/당류 필터) | 비회원 |
| `/brands/[brand]` | 브랜드별 메뉴 목록 | 비회원 |
| `/drinks/[brand]/[slug]` | 메뉴 상세 (SEO 핵심 페이지) | 비회원 |
| `/calculator/caffeine` | 카페인 계산기 (반감기 기반 잔존량) | 비회원 |
| `/dashboard` | 누적 섭취량, 주간 통계, 즐겨찾기 | 회원 |
| `/blog`, `/blog/[slug]` | 수면·카페인·건강 정보 콘텐츠 | 비회원 |
| `/login`, `/signup` | 인증 | - |
| `/admin` | 관리자 대시보드 (요약 통계) | 관리자 |
| `/admin/brands` | 브랜드 목록/등록/수정 | 관리자 |
| `/admin/drinks` | 메뉴 목록/등록/수정, 영양정보 입력 | 관리자 |
| `/admin/blog` | 블로그 글 작성/발행/수정 | 관리자 |

---

## 3. 디자인 시스템

> **업데이트**: `raw/UI guide/` 폴더의 실제 와이어프레임 이미지(홈 화면, 블로그 페이지)가
> 제공된 이후로는, 이 문서의 서술형 디자인 지침보다 **와이어프레임 이미지가 우선**한다.
> 아래 3.2 컬러 토큰은 와이어프레임 실물 스와치 기준으로 갱신된 값이다.

와이어프레임의 방향(그린 계열 + 밝은 배경, 카드형 UI)은 유지하되,
흔한 AI 생성 톤(크림+테라코타, 혹은 다크+네온 그린)으로 흐르지 않도록 아래 토큰을 그대로 따른다.

### 3.1 컨셉: "낮 → 밤"의 하루 흐름
카페인(각성/낮)과 수면(이완/밤)이라는 주제 자체가 시각적 대비를 갖고 있다.
이 대비를 홈 히어로와 계산기 결과 화면의 **시그니처 요소**로 사용한다:
잔존 카페인 그래프/게이지가 시간에 따라 "따뜻한 톤 → 차가운 톤"으로 자연스럽게 전이되는
그라디언트 하나로 표현한다. (장식이 아니라 실제 데이터를 나타내는 요소여야 함)

### 3.2 컬러 토큰
```
--color-bg:        #F6F7F8   /* Background — 와이어프레임 기준 */
--color-ink:        #333333   /* Text — 와이어프레임 기준 */
--color-brand:      #0F5B3A   /* Primary — 로고/주요 CTA */
--color-brand-soft: #E8F4EC   /* Secondary — 카드 배경/아이콘 원형 배경 */
--color-day:         #E8A94C   /* 카페인/낮 – 앰버 (계산기 시그니처 요소 전용) */
--color-night:       #364B7C   /* 수면/밤 – 인디고 (계산기 시그니처 요소 전용) */
--color-danger:      #B85C4A   /* 경고/한도초과 표시 전용, 장식적 사용 금지 */
```
→ 흔한 테라코타(#D97757) 액센트는 사용하지 않는다. day/night 두 액센트는
"시간대"를 의미할 때(계산기 타임라인, 대시보드 게이지 등)만 제한적으로 사용한다.
→ 카드 테두리처럼 배경과 대비가 필요한 hairline border는 `--color-brand-soft`가 아니라
`ink`의 낮은 투명도(예: `border-ink/10`)를 사용한다 — brand-soft는 배경과 명도차가 거의 없어
테두리로 쓰면 사실상 안 보인다.
→ 홈/블로그 2×2·리스트 카드의 아이콘은 카드마다 각기 다른 파스텔 톤(초록/보라/파랑/주황 등)을
와이어프레임 그대로 사용해도 된다 — 이 경우는 "시간대 의미"가 아니라 카테고리 구분 목적이므로
day/night 제한 규칙과 별개다.

### 3.3 타이포그래피
- 디스플레이(제목): 굵은 세리프 또는 슬랩세리프 계열 1종 (예: Noto Serif KR Bold) — 브랜드 신뢰감
- 본문: 가독성 좋은 산세리프 (예: Pretendard)
- 데이터/숫자(mg, kcal, g): 고정폭 느낌의 tabular-nums, 살짝 큰 사이즈로 카드 안에서 시선을 끌게

### 3.4 레이아웃 원칙
- 카드 기반 2×2 그리드는 유지 (와이어프레임 지시 그대로) — 실제로 4개 핵심 기능이 대칭 구조라 정당함
- 상세 페이지 숫자 카드(카페인/칼로리/당류)는 3열 고정, 모바일은 1열
- 반응형 기준: 1200 / 992 / 768 / 480px
- 불필요한 애니메이션 금지. 카드 hover는 미세한 elevation 변화 정도만.

### 3.5 시그니처 요소
잔존 카페인 계산 결과를 보여줄 때, 단순 숫자가 아니라
"타임라인 바"(취침 시각까지의 시간 축 위에 마신 음료들이 점으로 찍히고,
반감기 곡선이 낮 색(앰버)에서 밤 색(인디고)으로 흐르는 그라디언트 라인) 하나로 표현한다.
이게 이 서비스를 기억하게 만드는 유일한 시각 장치이며, 다른 곳에서는 과한 장식을 자제한다.

---

## 4. DB 스키마 (Supabase SQL 초안)

```sql
create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  created_at timestamptz default now()
);

create table drinks (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id),
  name_ko text not null,
  name_en text,
  slug text not null,
  size text,                      -- e.g. Tall, Grande
  temperature text check (temperature in ('hot','ice')),
  created_at timestamptz default now(),
  unique (brand_id, slug, size, temperature)
);

create table drink_nutrition (
  id uuid primary key default gen_random_uuid(),
  drink_id uuid references drinks(id),
  caffeine_mg numeric,
  calories_kcal numeric,
  sugar_g numeric,
  sodium_mg numeric,
  allergens text[],
  source_url text not null,
  checked_at date not null
);

create table user_drink_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  drink_id uuid references drinks(id),
  consumed_at timestamptz default now()
);

create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  drink_id uuid references drinks(id),
  created_at timestamptz default now()
);

create table user_settings (
  user_id uuid primary key references auth.users(id),
  daily_limit_mg numeric default 400,
  bedtime time default '23:00',
  sensitivity text default 'normal' check (sensitivity in ('low','normal','high'))
);

create table user_roles (
  user_id uuid primary key references auth.users(id),
  role text not null default 'member' check (role in ('member','admin'))
);

create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content jsonb not null,          -- Tiptap JSON
  status text not null default 'draft' check (status in ('draft','published')),
  category text check (category in ('카페인','수면','건강','라이프스타일','리뷰','가이드')),
  view_count integer not null default 0,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 비회원도 조회수를 올릴 수 있어야 하지만 blog_posts 쓰기는 관리자 전용이므로,
-- 조회수 증가만 허용하는 좁은 범위의 SECURITY DEFINER 함수로 우회한다.
create function public.increment_blog_view(post_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update blog_posts
  set view_count = view_count + 1
  where slug = post_slug and status = 'published';
$$;

grant execute on function public.increment_blog_view(text) to anon, authenticated;
```
> RLS(Row Level Security)는 `user_drink_logs`, `favorites`, `user_settings`에
> 반드시 `auth.uid() = user_id` 조건으로 적용할 것.
> `brands`, `drinks`, `drink_nutrition`은 **읽기는 전체 공개**, **쓰기(insert/update/delete)는
> `user_roles.role = 'admin'`인 사용자만** 가능하도록 RLS 정책을 건다.
> `blog_posts`는 `status = 'published'`인 글만 전체 공개 읽기 허용, 초안은 관리자만 조회 가능하며
> 쓰기는 관리자만 가능하도록 정책을 건다.
> 첫 관리자 계정은 Supabase 콘솔에서 수동으로 `user_roles`에 1행 넣어 지정한다 (가입 화면에는 관리자 가입 경로를 만들지 않는다).

---

## 5. 페이지별 상세 요구사항

### 홈 (`/`)
- 헤더: 로고(아이콘+워드마크) + 메뉴(음료 검색/수면 계산/블로그/내 기록) + 로그인/회원가입
  (로그인 시 로그아웃으로 전환, 관리자 계정에는 "관리자" 메뉴 추가 노출)
- 히어로: "오늘 마신 커피, 밤에 잠을 방해할까요?" 톤의 메시지(강조 단어는 brand 컬러) +
  브랜드 톤 일러스트(실사진 아님, SVG)
- **3단계 검색**: 브랜드 → 사이즈 → 메뉴명 순으로 단계별 드롭다운/입력창, `/drinks`로 이동
- 인기 검색어 chip (아메리카노, 라떼, 바닐라 라떼, 녹차, 디카페인, 콜드브루 등)
- 2×2 기능 카드: 검색 / 수면계산 / 내 기록 / 블로그, 카드마다 다른 색 아이콘 원형 배경 +
  우측 화살표(">")
- 최신 글 4개 미리보기(날짜 포함) + "전체 글 보기" 링크

### 음료 검색 (`/drinks`)
- 필터: 브랜드, 사이즈, 카페인 범위, 당류 범위, 칼로리 범위
- 검색어 자동완성 + 최근 검색어 로컬 저장(비회원도 가능, localStorage)
- 결과 카드: 이름 / 카페인mg / kcal / 당류g 한눈에

### 메뉴 상세 (`/drinks/[brand]/[slug]`)
- 숫자 카드 3열(카페인/칼로리/당류)
- **경고 문구는 조건부·완곡하게**: "취침 6시간 이내 섭취 시 민감한 사람은 수면에 영향을 받을 수 있습니다" 같이
  단정적 효능/치료 표현 금지, 일반 정보 고지 문구 포함
- source_url, checked_at 하단 고지
- 관련 글 2~3개 링크
- SEO: title/description/OG/canonical 동적 생성

### 카페인 계산기 (`/calculator/caffeine`)
- 비회원도 무제한 사용
- 음료 추가 + 섭취 시각 입력 → 반감기(약 5시간 가정, 안내 문구로 "개인차 있음" 명시) 기반 잔존량 계산
- 시그니처 타임라인 바 시각화 (3.5 참고)
- 로그인 사용자에게만 "오늘 기록에 저장" 버튼 노출

### 대시보드 (`/dashboard`, 회원 전용)
- 오늘 섭취량 / 일일 권장량 대비 % (게이지)
- 취침 예정 시각 기준 예상 잔존 카페인
- 개인 설정: 일일 권장량, 취침시각, 민감도
- 임신부/청소년 등 민감군 안내는 별도 정보성 문구로, 진단성 표현 금지

### 블로그 목록 (`/blog`)
- 히어로: 제목 + 설명 + 일러스트
- 검색창(제목 검색) + 카테고리 필터 pill(전체/카페인/수면/건강/라이프스타일/리뷰/가이드) +
  정렬(최신순/인기순=조회수)
- 글 카드(세로 리스트): 카테고리 태그(카테고리별 고유 색), 제목, 본문에서 자동 추출한 요약,
  발행일 · 고정 작성자("CaffeineNote Team") · 조회수
- 페이지네이션 (5개씩)
- 썸네일은 실제 이미지가 없으므로 카테고리색 아이콘 플레이스홀더로 대체

### 블로그 상세 (`/blog/[slug]`)
- 2단 레이아웃: 본문 + sticky sidebar(검색/계산기 링크/광고 영역/인기글), `position: sticky; top: 80px`
- 건강 정보 글은 상단에 "일반 정보이며 의학적 조언이 아님" 고지 박스 고정 배치
- 상세 페이지 진입 시 `increment_blog_view` RPC로 조회수 1 증가

---

### 관리자 페이지 (`/admin/*`, 관리자 전용)
- DB 입력은 수동 SQL이 아니라 **이 관리자 페이지를 통해서만** 이루어진다. 즉 콘텐츠 운영자가
  코드를 몰라도 브랜드/메뉴/영양정보/블로그 글을 등록·수정할 수 있어야 한다.
- `/admin/brands`: 브랜드명, slug, 로고 업로드/URL 입력, 목록 테이블 + 등록/수정 폼
- `/admin/drinks`: 브랜드 선택 → 메뉴명(한/영), slug, 사이즈, HOT/ICE, 카페인·칼로리·당류·나트륨,
  알러지 정보, **source_url·checked_at은 필수 입력 필드**(빈 값으로 저장 불가하게 검증)
- `/admin/drinks` 목록 화면에는 `checked_at`이 오래된(예: 6개월 이상) 항목을 상단에 강조 표시해서
  데이터 최신화를 유도
- `/admin/blog`: 제목, slug, 카테고리(카페인/수면/건강/라이프스타일/리뷰/가이드 중 선택),
  본문(**리치텍스트 에디터, Tiptap 사용**), 발행 상태(초안/발행), 발행일.
  본문 저장 포맷은 Tiptap의 JSON 또는 HTML로 DB(`blog_posts.content`)에 저장하고, 상세 페이지에서
  그대로 렌더링한다. 광고 영역·계산기 링크·인기글은 본문에 끼워넣지 않고, 8장 "블로그" 요구사항대로
  **레이아웃(sticky sidebar) 레벨에서 고정 배치**한다.
- 접근 제어: `/admin` 하위 전체는 `user_roles.role = 'admin'`이 아니면 홈으로 리다이렉트
  (미들웨어 또는 서버 컴포넌트에서 체크, 클라이언트단 숨김만으로 처리하지 않음)
- 관리자 UI는 공개 페이지와 톤을 분리해도 된다 (심플한 테이블+폼 위주, 시그니처 디자인 요소 불필요)

## 6. SEO / PWA 요구사항
- 모든 상세/블로그 페이지: 동적 title, description, OG 태그, canonical
- `sitemap.xml`, `robots.txt` 자동 생성
- 구조화 데이터(JSON-LD): 음료 상세는 `Product` 또는 `NutritionInformation` 스키마 검토
- PWA manifest + service worker, 홈 화면 추가 지원
- 이미지: WebP, 히어로 이미지는 배경 투명 PNG 우선

---

## 7. 단계별 실행 계획 (Claude Code용)

**중요 작업 방식**: 각 Phase를 마치면 브라우저로 결과를 확인하고, 짧게 요약 보고한 뒤
다음 Phase로 넘어가세요. TodoWrite로 Phase 내 작업을 체크리스트화해서 진행 상황을 추적하세요.

- **Phase 1 — 프로젝트 세팅**
  Next.js(App Router) + TypeScript + Tailwind + Supabase 클라이언트 세팅.
  라우트 스켈레톤(홈/검색/블로그/로그인/대시보드) 생성. 위 3장 디자인 토큰을 `tailwind.config`와
  전역 CSS 변수로 반영. 완료 기준: 로컬 실행 + 기본 레이아웃 렌더링.

- **Phase 2 — DB 스키마**
  4장의 SQL을 Supabase 마이그레이션 파일로 작성, RLS 정책 포함(관리자 쓰기 권한 포함).
  최소한의 시드 데이터(브랜드 1개 정도)만 넣고, 나머지 데이터 입력은 Phase 3 관리자 페이지로 넘긴다.
  완료 기준: Supabase에 테이블 생성 및 RLS 정책 확인.

- **Phase 3 — 인증 + 관리자 페이지**
  Supabase Auth 기본 연동(로그인/가입) + `/admin/brands`, `/admin/drinks`, `/admin/blog` 구현.
  완료 기준: 관리자 계정으로 로그인 후 브랜드 1개, 메뉴 10개 이상, 블로그 글 1개를 실제로 등록 가능.
  ※ 이후 Phase는 이 관리자 페이지로 입력한 실 데이터를 기준으로 확인한다.

- **Phase 4 — 홈 화면**
  5장 "홈" 요구사항대로 구현. 완료 기준: 검색창에서 `/drinks?q=` 로 이동 동작.

- **Phase 5 — 음료 검색 + 상세**
  `/drinks`, `/brands/[brand]`, `/drinks/[brand]/[slug]` 구현.
  완료 기준: 관리자 페이지로 입력한 데이터 기준 브랜드별 검색 및 상세 진입 가능.

- **Phase 6 — 카페인 계산기**
  반감기 계산 로직 + 시그니처 타임라인 시각화 구현. 완료 기준: 비회원도 계산·시각화 정상 동작.

- **Phase 7 — 회원 대시보드**
  `/dashboard`에서 오늘 섭취량/통계/설정 구현. 완료 기준: 일반 회원 로그인 시 대시보드 접근,
  계산기에서 "오늘 기록 저장" 동작, 관리자 페이지와는 접근 권한이 분리되어 있는지 확인.

- **Phase 8 — 블로그 + 광고 레이아웃**
  sticky sidebar 구조 구현 (콘텐츠는 관리자 페이지에서 이미 등록된 글 사용).
  완료 기준: 상세 페이지 사이드바 sticky 동작 확인.

- **Phase 9 — SEO/PWA 마무리**
  6장 항목 전부 적용. 완료 기준: Lighthouse SEO/PWA 점수 확인, sitemap 접근 가능.

---

## 8. 하지 말아야 할 것 (Non-goals for MVP)
- React Native 앱 개발 (트래픽 확인 후 별도 진행)
- 결제/구독 기능
- 실시간 채팅/커뮤니티 기능
- 의학적 진단성 문구 — 항상 "일반 정보" 톤 유지

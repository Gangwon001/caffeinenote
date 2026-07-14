// Curated list of common menu terms used to heuristically link a blog post
// to relevant drinks — there's no dedicated post↔drink relation in the
// schema, so this matches whatever drink names are mentioned in the title
// or excerpt against actual catalog names.
const DRINK_KEYWORDS = [
  "아메리카노",
  "라떼",
  "카푸치노",
  "콜드브루",
  "에스프레소",
  "마키아토",
  "모카",
  "프라푸치노",
  "아인슈페너",
  "디카페인",
  "바닐라",
  "카라멜",
  "헤이즐넛",
  "돌체",
  "그린티",
  "녹차",
  "말차",
  "홍차",
  "얼그레이",
  "자몽",
  "레몬",
  "스무디",
  "프라페",
  "밀크티",
  "초콜릿",
  "블렌디드",
];

export function findMentionedDrinkKeywords(text: string): string[] {
  return DRINK_KEYWORDS.filter((keyword) => text.includes(keyword));
}

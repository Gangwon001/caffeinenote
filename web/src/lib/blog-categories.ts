export const BLOG_CATEGORIES = [
  { value: "카페인", bg: "#E8F4EC", color: "#0F5B3A" },
  { value: "수면", bg: "#EDE9FB", color: "#8B7FE0" },
  { value: "건강", bg: "#E3EEFC", color: "#4F8FDA" },
  { value: "라이프스타일", bg: "#FBEADF", color: "#D98A4B" },
  { value: "리뷰", bg: "#FBE7EF", color: "#D46A93" },
  { value: "가이드", bg: "#E1F3F3", color: "#3E9C9C" },
] as const;

export function getCategoryStyle(category: string | null) {
  return BLOG_CATEGORIES.find((c) => c.value === category);
}

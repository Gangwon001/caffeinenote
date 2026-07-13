export const BLOG_CATEGORIES = [
  { value: "카페인", bg: "#E8F4EC", color: "#0F5B3A" },
  { value: "수면", bg: "#E3E4FB", color: "#4338CA" }, // Indigo Blue
  { value: "건강", bg: "#FCE8EC", color: "#C2486A" }, // Pastel Rose
  { value: "라이프스타일", bg: "#FBF3D6", color: "#B8862B" }, // Pastel Mustard
  { value: "리뷰", bg: "#FBE7EF", color: "#D46A93" },
  { value: "가이드", bg: "#E1F3F3", color: "#3E9C9C" },
] as const;

export function getCategoryStyle(category: string | null) {
  return BLOG_CATEGORIES.find((c) => c.value === category);
}

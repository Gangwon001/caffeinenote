import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "카페인노트 | CaffeineNote",
    short_name: "카페인노트",
    description:
      "카페 음료의 카페인·칼로리·당류를 검색하고, 취침 시간 기준 잔존 카페인을 계산해보세요.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5ef",
    theme_color: "#3d6b52",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}

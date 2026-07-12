import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개 | 카페인노트",
  description: "카페인노트가 어떤 서비스인지 소개합니다.",
};

export default function AboutPage() {
  return (
    <main className="flex-1 p-8">
      <div className="max-w-2xl mx-auto blog-content">
        <h1>카페인노트 소개</h1>
        <p>
          카페인노트는 브랜드별 카페 음료의 카페인·칼로리·당류 정보를 한눈에 검색하고, 취침
          예정 시각을 기준으로 잔존 카페인을 계산해 숙면에 미치는 영향을 미리 확인할 수 있는
          서비스입니다.
        </p>
        <h2>이런 기능을 제공해요</h2>
        <ul>
          <li>스타벅스, 투썸플레이스, 메가커피 등 주요 카페 브랜드의 음료 영양 정보 검색</li>
          <li>마신 음료와 취침 시각을 입력하면 잔존 카페인을 계산해주는 카페인 계산기</li>
          <li>하루 동안 마신 음료를 기록하고 누적 섭취량을 관리하는 내 기록 페이지</li>
          <li>카페인과 수면, 건강에 관한 정보를 다루는 블로그</li>
        </ul>
        <p>
          카페인노트는 정확한 정보를 바탕으로 사용자가 스스로에게 맞는 카페인 섭취 습관을
          만들어갈 수 있도록 돕는 것을 목표로 합니다.
        </p>
      </div>
    </main>
  );
}

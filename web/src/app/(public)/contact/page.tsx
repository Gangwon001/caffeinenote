import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의 | 카페인노트",
  description: "카페인노트에 문의하는 방법을 안내합니다.",
};

export default function ContactPage() {
  return (
    <main className="flex-1 p-8">
      <div className="max-w-2xl mx-auto blog-content">
        <h1>문의하기</h1>
        <p>
          서비스 이용 중 궁금한 점이나 오류 제보, 제휴 문의 등은 아래 이메일로 연락해주세요.
          영업일 기준 빠른 시일 내에 답변드리겠습니다.
        </p>
        <p>
          <a href="mailto:wonhyeok619@gmail.com">wonhyeok619@gmail.com</a>
        </p>
      </div>
    </main>
  );
}

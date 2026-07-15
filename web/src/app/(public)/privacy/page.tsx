import type { Metadata } from "next";
import OutboundLink from "@/components/analytics/OutboundLink";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 카페인노트",
  description: "카페인노트의 개인정보처리방침을 안내합니다.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="flex-1 p-8">
      <div className="max-w-2xl mx-auto blog-content">
        <h1>개인정보처리방침</h1>
        <p>
          카페인노트(이하 &ldquo;서비스&rdquo;)는 이용자의 개인정보를 소중히 다루며, 아래와 같은
          기준에 따라 개인정보를 수집·이용·보관합니다.
        </p>

        <h2>1. 수집하는 개인정보 항목</h2>
        <ul>
          <li>회원가입 시: 이메일 주소, 비밀번호(암호화 저장)</li>
          <li>서비스 이용 중: 음료 섭취 기록(음료명, 카페인양, 섭취 시각), 즐겨찾기, 취침 시각·카페인 민감도 등 계산기 설정값</li>
          <li>자동 수집 정보: 로그인 상태 유지를 위한 세션 쿠키</li>
        </ul>

        <h2>2. 개인정보의 수집 및 이용 목적</h2>
        <ul>
          <li>회원 식별 및 로그인 유지</li>
          <li>음료 섭취 기록, 잔존 카페인 계산 등 서비스 핵심 기능 제공</li>
          <li>비밀번호 찾기 등 계정 관련 문의 대응</li>
        </ul>

        <h2>3. 보유 및 이용 기간</h2>
        <p>
          수집한 개인정보는 회원 탈퇴 시까지 보관하며, 탈퇴 시 지체 없이 파기합니다. 단, 관계
          법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
        </p>

        <h2>4. 개인정보의 제3자 제공 및 처리 위탁</h2>
        <p>
          서비스는 이용자의 개인정보를 외부에 판매하거나 광고 목적으로 제공하지 않습니다.
          다만 회원 인증과 데이터 저장을 위해 인프라 제공업체(Supabase)에 처리를 위탁하고
          있으며, 위탁받은 업체는 계약을 통해 개인정보를 안전하게 관리합니다.
        </p>

        <h2>5. 광고 및 쿠키 사용</h2>
        <p>
          카페인노트는 Google AdSense를 비롯한 광고 서비스를 사용하여 사이트 운영 비용을 충당할
          수 있습니다.
        </p>
        <ul>
          <li>
            Google 등 제3자 광고 제공업체는 이용자의 이전 방문 기록을 바탕으로 관련성 높은 광고를
            게재하기 위해 쿠키(구글의 경우 DoubleClick 쿠키 등)를 사용할 수 있습니다.
          </li>
          <li>
            이 쿠키를 통해 광고 게재 이력이 기록되며, 이는 광고가 반복적으로 노출되는 것을 막고
            광고 효과를 측정하는 데 활용됩니다.
          </li>
          <li>
            이용자는{" "}
            <OutboundLink
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google 광고 설정
            </OutboundLink>
            에서 맞춤형 광고 게재를 원하지 않는다고 설정할 수 있습니다. 맞춤 광고를
            비활성화하더라도 광고 자체가 완전히 사라지는 것은 아니며, 대략적인 위치나 검색어 등
            비개인화 정보를 기반으로 한 광고는 계속 노출될 수 있습니다.
          </li>
          <li>
            <OutboundLink
              href="http://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer"
            >
              aboutads.info
            </OutboundLink>{" "}
            또는 브라우저 자체 설정을 통해서도 여러 광고 제공업체의 쿠키를 관리할 수 있습니다.
          </li>
          <li>
            Google이 파트너 사이트에서 데이터를 수집·사용하는 방식에 대해서는{" "}
            <OutboundLink
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google 광고 정책 페이지
            </OutboundLink>
            에서 자세히 확인할 수 있습니다.
          </li>
        </ul>

        <h2>6. 이용자의 권리</h2>
        <p>
          이용자는 언제든지 자신의 개인정보를 조회·수정할 수 있으며, 회원 탈퇴를 통해 개인정보
          삭제를 요청할 수 있습니다. 문의는 아래 연락처로 접수해주세요.
        </p>

        <h2>7. 개인정보 관련 문의</h2>
        <p>
          개인정보 처리와 관련한 문의사항은{" "}
          <a href="mailto:wonhyeok619@gmail.com">wonhyeok619@gmail.com</a>으로 연락해주시기
          바랍니다.
        </p>

        <p>시행일: 2026년 7월 15일</p>
      </div>
    </main>
  );
}

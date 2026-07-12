"use client";

export default function ResetTodayButton({ action }: { action: () => void }) {
  return (
    <form action={action}>
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm("오늘 기록을 모두 삭제할까요? 되돌릴 수 없어요.")) {
            e.preventDefault();
          }
        }}
        className="text-sm text-danger underline"
      >
        오늘 기록 초기화
      </button>
    </form>
  );
}

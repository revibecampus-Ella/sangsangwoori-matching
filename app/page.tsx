import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-16 text-center">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">상상우리</h1>
      <p className="text-2xl text-gray-600 mb-12">
        시니어와 일자리를 연결하는 자동 매칭 서비스
      </p>
      <div className="flex flex-col sm:flex-row gap-6">
        <Link
          href="/register"
          className="flex items-center justify-center h-16 px-10 text-xl font-semibold rounded-xl bg-gray-900 text-white hover:bg-gray-700 transition-colors"
        >
          프로필 등록하기
        </Link>
        <Link
          href="/recommendations"
          className="flex items-center justify-center h-16 px-10 text-xl font-semibold rounded-xl border-2 border-gray-900 text-gray-900 hover:bg-gray-100 transition-colors"
        >
          추천 목록 보기
        </Link>
        <Link
          href="/admin"
          className="flex items-center justify-center h-16 px-10 text-xl font-semibold rounded-xl border-2 border-gray-500 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          관리자 대시보드
        </Link>
      </div>
    </div>
  );
}

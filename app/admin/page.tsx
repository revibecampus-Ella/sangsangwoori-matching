import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLUMNS = [
  {
    id: "unmatched",
    label: "미매칭",
    color: "bg-red-100 border-red-300",
    badgeClass: "bg-red-600 text-white",
    count: 0,
  },
  {
    id: "pending",
    label: "매칭 대기",
    color: "bg-yellow-100 border-yellow-300",
    badgeClass: "bg-yellow-500 text-white",
    count: 0,
  },
  {
    id: "assigned",
    label: "배정 완료",
    color: "bg-green-100 border-green-300",
    badgeClass: "bg-green-600 text-white",
    count: 0,
  },
];

export default function AdminPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">담당자 대시보드</h1>
      <p className="text-xl text-gray-500 mb-10">
        시니어 매칭 현황을 한눈에 확인하고 관리하세요.
      </p>

      {/* 요약 통계 */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {COLUMNS.map((col) => (
          <Card key={col.id} className={`border-2 ${col.color} shadow-sm`}>
            <CardContent className="flex flex-col items-center py-8">
              <p className="text-xl font-semibold text-gray-700 mb-3">{col.label}</p>
              <span className={`text-5xl font-bold px-6 py-2 rounded-xl ${col.badgeClass}`}>
                {col.count}
              </span>
              <p className="text-lg text-gray-500 mt-3">건</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 칸반 보드 */}
      <div className="grid grid-cols-3 gap-6">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex flex-col gap-3">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${col.color}`}>
              <h2 className="text-2xl font-bold text-gray-800">{col.label}</h2>
              <Badge className={`text-base px-3 py-0.5 ${col.badgeClass}`}>
                {col.count}
              </Badge>
            </div>

            <div className="flex flex-col gap-3 min-h-64 p-4 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-xl text-gray-400 text-center mt-6">
                항목 없음
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-gray-400 text-lg mt-10">
        ※ 기능 구현 예정 — 현재는 레이아웃 뼈대입니다.
      </p>
    </div>
  );
}

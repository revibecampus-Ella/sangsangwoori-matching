import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PLACEHOLDER_ITEMS = [
  { rank: 1, seniorName: "—", jobTitle: "—", region: "—", score: "—" },
  { rank: 2, seniorName: "—", jobTitle: "—", region: "—", score: "—" },
  { rank: 3, seniorName: "—", jobTitle: "—", region: "—", score: "—" },
];

export default function RecommendationsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">자동 매칭 추천 목록</h1>
      <p className="text-xl text-gray-500 mb-10">
        매칭 점수 높은 순으로 추천 결과가 표시됩니다.
      </p>

      <div className="flex flex-col gap-4">
        {PLACEHOLDER_ITEMS.map((item) => (
          <Card
            key={item.rank}
            className="border-2 border-gray-200 shadow-sm hover:border-gray-400 transition-colors"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-gray-800">
                  #{item.rank} {item.seniorName}
                </CardTitle>
                <Badge className="text-lg px-4 py-1 bg-gray-900 text-white">
                  점수: {item.score}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-8 text-xl text-gray-600">
                <span>
                  <span className="font-semibold text-gray-800">직종:</span>{" "}
                  {item.jobTitle}
                </span>
                <span>
                  <span className="font-semibold text-gray-800">지역:</span>{" "}
                  {item.region}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-300 rounded-xl text-gray-400">
        <p className="text-2xl font-semibold mb-2">아직 추천 결과가 없습니다</p>
        <p className="text-xl">시니어 프로필을 등록하면 자동으로 매칭됩니다.</p>
      </div>

      <p className="text-center text-gray-400 text-lg mt-6">
        ※ 기능 구현 예정 — 현재는 레이아웃 뼈대입니다.
      </p>
    </div>
  );
}

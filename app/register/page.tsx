import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">시니어 프로필 등록</h1>
      <p className="text-xl text-gray-500 mb-10">
        아래 정보를 입력하시면 맞춤 일자리를 추천해 드립니다.
      </p>

      <Card className="border-2 border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-xl font-semibold text-gray-700">
                이름
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="성함을 입력해 주세요"
                className="h-14 text-xl border-2 border-gray-300 focus:border-gray-900 rounded-lg px-4"
                disabled
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="region" className="text-xl font-semibold text-gray-700">
                거주 지역
              </Label>
              <Input
                id="region"
                type="text"
                placeholder="예: 서울 강남구"
                className="h-14 text-xl border-2 border-gray-300 focus:border-gray-900 rounded-lg px-4"
                disabled
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="desired_job" className="text-xl font-semibold text-gray-700">
                희망 직종
              </Label>
              <Input
                id="desired_job"
                type="text"
                placeholder="예: 경비, 청소, 배달 보조"
                className="h-14 text-xl border-2 border-gray-300 focus:border-gray-900 rounded-lg px-4"
                disabled
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="career_years" className="text-xl font-semibold text-gray-700">
                경력 (년)
              </Label>
              <Input
                id="career_years"
                type="number"
                placeholder="예: 5"
                min={0}
                className="h-14 text-xl border-2 border-gray-300 focus:border-gray-900 rounded-lg px-4"
                disabled
              />
            </div>

            <Button
              type="submit"
              disabled
              className="h-16 text-2xl font-bold bg-gray-900 hover:bg-gray-700 text-white rounded-xl mt-2"
            >
              등록하기
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-gray-400 text-lg mt-6">
        ※ 기능 구현 예정 — 현재는 레이아웃 뼈대입니다.
      </p>
    </div>
  );
}

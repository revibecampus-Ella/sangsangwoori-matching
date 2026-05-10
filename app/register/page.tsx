"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

const REGIONS = ["서울", "경기", "인천", "기타"];
const JOBS = ["경비", "청소", "조리", "돌봄", "기타"];

type FormState = {
  name: string;
  region: string;
  desired_job: string;
  career_years: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    region: "",
    desired_job: "",
    career_years: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function validate(): Errors {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "이름을 입력해 주세요.";
    if (!form.region) e.region = "지역을 선택해 주세요.";
    if (!form.desired_job) e.desired_job = "희망 직종을 선택해 주세요.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStatus("loading");

    const { data, error } = await supabase
      .from("seniors")
      .insert({
        name: form.name.trim(),
        region: form.region,
        desired_job: form.desired_job,
        career_years: form.career_years ? parseInt(form.career_years) : 0,
      })
      .select("id")
      .single();

    if (error || !data) {
      setStatus("error");
      return;
    }

    // 매칭 재계산 (Supabase RPC)
    await supabase.rpc("recalculate_matches_for_senior", { p_senior_id: data.id });

    setStatus("success");
    setForm({ name: "", region: "", desired_job: "", career_years: "" });
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold text-gray-900 mb-3">시니어 일자리 신청하기</h1>
      <p className="text-xl text-gray-600 mb-10">
        아래 정보를 입력해 주시면 담당자가 맞춤 일자리를 안내해 드립니다.
      </p>

      {status === "success" && (
        <div className="mb-8 rounded-xl border-2 border-green-500 bg-green-50 px-6 py-5 text-xl font-semibold text-green-800">
          ✅ 등록이 완료되었습니다. 담당자가 곧 연락드립니다.
        </div>
      )}
      {status === "error" && (
        <div className="mb-8 rounded-xl border-2 border-red-400 bg-red-50 px-6 py-5 text-xl font-semibold text-red-800">
          ❌ 저장 중 오류가 발생했습니다. 다시 시도해 주세요.
        </div>
      )}

      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">기본 정보를 입력해 주세요</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* 이름 */}
            <div className="flex flex-col gap-2">
              <p className="text-lg text-gray-500">성함이 어떻게 되세요?</p>
              <Label htmlFor="name" className="text-xl font-semibold text-gray-800">
                이름 <span className="text-red-500">*</span>
              </Label>
              {errors.name && (
                <p className="rounded-lg bg-red-50 border border-red-400 px-4 py-2 text-lg text-red-700">
                  {errors.name}
                </p>
              )}
              <Input
                id="name"
                type="text"
                placeholder="성함을 입력해 주세요"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-14 text-xl border-2 border-gray-300 rounded-lg px-4"
              />
            </div>

            {/* 지역 */}
            <div className="flex flex-col gap-2">
              <p className="text-lg text-gray-500">어디에서 일하고 싶으세요?</p>
              <Label className="text-xl font-semibold text-gray-800">
                거주 지역 <span className="text-red-500">*</span>
              </Label>
              {errors.region && (
                <p className="rounded-lg bg-red-50 border border-red-400 px-4 py-2 text-lg text-red-700">
                  {errors.region}
                </p>
              )}
              <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v ?? "" })}>
                <SelectTrigger className="h-14 text-xl border-2 border-gray-300 rounded-lg">
                  <SelectValue placeholder="지역을 선택해 주세요" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r} className="text-xl py-3">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 희망 직종 */}
            <div className="flex flex-col gap-2">
              <p className="text-lg text-gray-500">어떤 일을 하시겠어요?</p>
              <Label className="text-xl font-semibold text-gray-800">
                희망 직종 <span className="text-red-500">*</span>
              </Label>
              {errors.desired_job && (
                <p className="rounded-lg bg-red-50 border border-red-400 px-4 py-2 text-lg text-red-700">
                  {errors.desired_job}
                </p>
              )}
              <Select value={form.desired_job} onValueChange={(v) => setForm({ ...form, desired_job: v ?? "" })}>
                <SelectTrigger className="h-14 text-xl border-2 border-gray-300 rounded-lg">
                  <SelectValue placeholder="직종을 선택해 주세요" />
                </SelectTrigger>
                <SelectContent>
                  {JOBS.map((j) => (
                    <SelectItem key={j} value={j} className="text-xl py-3">{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 경력 */}
            <div className="flex flex-col gap-2">
              <p className="text-lg text-gray-500">일하신 경험이 몇 년이나 되세요? (없으시면 0)</p>
              <Label htmlFor="career_years" className="text-xl font-semibold text-gray-800">
                경력 (년)
              </Label>
              <Input
                id="career_years"
                type="number"
                placeholder="예: 5 (없으면 0)"
                min={0}
                value={form.career_years}
                onChange={(e) => setForm({ ...form, career_years: e.target.value })}
                className="h-14 text-xl border-2 border-gray-300 rounded-lg px-4"
              />
            </div>

            <Button
              type="submit"
              disabled={status === "loading"}
              className="h-16 text-2xl font-bold bg-gray-900 hover:bg-gray-700 text-white rounded-xl mt-2"
            >
              {status === "loading" ? "저장 중…" : "신청하기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

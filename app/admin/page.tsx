"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";

const REGIONS = ["서울", "경기", "인천", "기타"];
const JOB_TYPES = ["경비", "청소", "조리", "돌봄", "기타"];

const COLUMNS = [
  { id: "unmatched", label: "미매칭", color: "bg-red-100 border-red-300", badgeClass: "bg-red-600 text-white" },
  { id: "pending",   label: "매칭 대기", color: "bg-yellow-100 border-yellow-300", badgeClass: "bg-yellow-500 text-white" },
  { id: "assigned",  label: "배정 완료", color: "bg-green-100 border-green-300", badgeClass: "bg-green-600 text-white" },
];

type Job = {
  id: string;
  title: string;
  region: string;
  job_type: string;
  required_career: number;
};

type JobForm = {
  title: string;
  region: string;
  job_type: string;
  required_career: string;
};

type JobFormErrors = Partial<Record<keyof JobForm, string>>;

export default function AdminPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState<JobForm>({ title: "", region: "", job_type: "", required_career: "" });
  const [errors, setErrors] = useState<JobFormErrors>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
    if (data) setJobs(data);
  }

  function validate(): JobFormErrors {
    const e: JobFormErrors = {};
    if (!form.title.trim()) e.title = "공고명을 입력해 주세요.";
    if (!form.region) e.region = "지역을 선택해 주세요.";
    if (!form.job_type) e.job_type = "직종을 선택해 주세요.";
    return e;
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setErrors({});
    setSaveStatus("loading");
    const { error } = await supabase.from("jobs").insert({
      title: form.title.trim(),
      region: form.region,
      job_type: form.job_type,
      required_career: form.required_career ? parseInt(form.required_career) : 0,
    });
    if (error) {
      setSaveStatus("error");
    } else {
      setSaveStatus("success");
      setForm({ title: "", region: "", job_type: "", required_career: "" });
      fetchJobs();
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }

  async function handleDeleteJob(id: string) {
    await supabase.from("jobs").delete().eq("id", id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">담당자 대시보드</h1>
      <p className="text-xl text-gray-500 mb-10">
        시니어 매칭 현황과 일자리를 관리하세요.
      </p>

      {/* 요약 통계 */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {COLUMNS.map((col) => (
          <Card key={col.id} className={`border-2 ${col.color} shadow-sm`}>
            <CardContent className="flex flex-col items-center py-8">
              <p className="text-xl font-semibold text-gray-700 mb-3">{col.label}</p>
              <span className={`text-5xl font-bold px-6 py-2 rounded-xl ${col.badgeClass}`}>0</span>
              <p className="text-lg text-gray-500 mt-3">건</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 칸반 보드 */}
      <div className="grid grid-cols-3 gap-6 mb-16">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex flex-col gap-3">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${col.color}`}>
              <h2 className="text-2xl font-bold text-gray-800">{col.label}</h2>
              <Badge className={`text-base px-3 py-0.5 ${col.badgeClass}`}>0</Badge>
            </div>
            <div className="flex flex-col gap-3 min-h-40 p-4 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-xl text-gray-400 text-center mt-4">항목 없음</p>
            </div>
          </div>
        ))}
      </div>

      {/* ───── 일자리 관리 ───── */}
      <h2 className="text-3xl font-bold text-gray-900 mb-6 border-t-2 border-gray-200 pt-10">
        일자리 관리
      </h2>

      {/* 일자리 추가 폼 */}
      <Card className="border-2 border-gray-200 shadow-sm mb-10">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">새 일자리 추가</CardTitle>
        </CardHeader>
        <CardContent>
          {saveStatus === "success" && (
            <div className="mb-6 rounded-xl border-2 border-green-500 bg-green-50 px-6 py-3 text-xl font-semibold text-green-800">
              ✅ 일자리가 등록되었습니다.
            </div>
          )}
          {saveStatus === "error" && (
            <div className="mb-6 rounded-xl border-2 border-red-400 bg-red-50 px-6 py-3 text-xl font-semibold text-red-800">
              ❌ 저장 중 오류가 발생했습니다.
            </div>
          )}

          <form onSubmit={handleAddJob} className="flex flex-col gap-6">
            {/* 공고명 */}
            <div className="flex flex-col gap-2">
              <Label className="text-xl font-semibold text-gray-700">
                공고명 <span className="text-red-500">*</span>
              </Label>
              {errors.title && (
                <p className="rounded-lg bg-red-50 border border-red-400 px-4 py-2 text-lg text-red-700">
                  {errors.title}
                </p>
              )}
              <Input
                type="text"
                placeholder="예: 강남구 경비원 모집"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-14 text-xl border-2 border-gray-300 rounded-lg px-4"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* 지역 */}
              <div className="flex flex-col gap-2">
                <Label className="text-xl font-semibold text-gray-700">
                  지역 <span className="text-red-500">*</span>
                </Label>
                {errors.region && (
                  <p className="rounded-lg bg-red-50 border border-red-400 px-4 py-2 text-lg text-red-700">
                    {errors.region}
                  </p>
                )}
                <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                  <SelectTrigger className="h-14 text-xl border-2 border-gray-300 rounded-lg">
                    <SelectValue placeholder="지역 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => (
                      <SelectItem key={r} value={r} className="text-xl py-3">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 직종 */}
              <div className="flex flex-col gap-2">
                <Label className="text-xl font-semibold text-gray-700">
                  직종 <span className="text-red-500">*</span>
                </Label>
                {errors.job_type && (
                  <p className="rounded-lg bg-red-50 border border-red-400 px-4 py-2 text-lg text-red-700">
                    {errors.job_type}
                  </p>
                )}
                <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
                  <SelectTrigger className="h-14 text-xl border-2 border-gray-300 rounded-lg">
                    <SelectValue placeholder="직종 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((j) => (
                      <SelectItem key={j} value={j} className="text-xl py-3">{j}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 요구 경력 */}
            <div className="flex flex-col gap-2">
              <Label className="text-xl font-semibold text-gray-700">요구 경력 (년)</Label>
              <Input
                type="number"
                placeholder="예: 2 (없으면 0)"
                min={0}
                value={form.required_career}
                onChange={(e) => setForm({ ...form, required_career: e.target.value })}
                className="h-14 text-xl border-2 border-gray-300 rounded-lg px-4"
              />
            </div>

            <Button
              type="submit"
              disabled={saveStatus === "loading"}
              className="h-14 text-xl font-bold bg-gray-900 hover:bg-gray-700 text-white rounded-xl"
            >
              {saveStatus === "loading" ? "저장 중…" : "일자리 추가"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 일자리 목록 */}
      <Card className="border-2 border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">
            등록된 일자리 ({jobs.length}건)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-xl text-gray-400 text-center py-10">
              등록된 일자리가 없습니다.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-lg font-bold text-gray-700">공고명</TableHead>
                  <TableHead className="text-lg font-bold text-gray-700">지역</TableHead>
                  <TableHead className="text-lg font-bold text-gray-700">직종</TableHead>
                  <TableHead className="text-lg font-bold text-gray-700">요구 경력</TableHead>
                  <TableHead className="text-lg font-bold text-gray-700">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="text-xl">{job.title}</TableCell>
                    <TableCell className="text-xl">{job.region}</TableCell>
                    <TableCell className="text-xl">{job.job_type}</TableCell>
                    <TableCell className="text-xl">{job.required_career}년 이상</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-lg h-10 px-4"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        삭제
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

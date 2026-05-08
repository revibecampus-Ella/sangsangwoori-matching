"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
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

type Senior = {
  id: string;
  name: string;
  region: string;
  desired_job: string;
  career_years: number;
};

type Match = {
  senior_id: string;
  score: number;
  status: string;
};

type Job = {
  id: string;
  title: string;
  region: string;
  job_type: string;
  required_career: number;
};

type JobForm = { title: string; region: string; job_type: string; required_career: string };
type JobFormErrors = Partial<Record<keyof JobForm, string>>;

type EffectiveStatus = "unmatched" | "pending" | "assigned";

function getEffectiveStatus(seniorId: string, matches: Match[]): EffectiveStatus {
  const sm = matches.filter((m) => m.senior_id === seniorId);
  if (sm.some((m) => m.status === "assigned" || m.status === "done")) return "assigned";
  if (sm.some((m) => m.score > 0)) return "pending";
  return "unmatched";
}

function getBestScore(seniorId: string, matches: Match[]): number {
  const scores = matches.filter((m) => m.senior_id === seniorId).map((m) => m.score);
  return scores.length > 0 ? Math.max(...scores) : 0;
}

const STATUS_LABEL: Record<EffectiveStatus, string> = {
  unmatched: "미매칭",
  pending: "매칭 대기",
  assigned: "배정 완료",
};

const STATUS_BADGE: Record<EffectiveStatus, string> = {
  unmatched: "bg-red-100 text-red-700 border border-red-300",
  pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  assigned: "bg-green-100 text-green-700 border border-green-300",
};

export default function AdminPage() {
  const [seniors, setSeniors] = useState<Senior[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [form, setForm] = useState<JobForm>({ title: "", region: "", job_type: "", required_career: "" });
  const [errors, setErrors] = useState<JobFormErrors>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [{ data: s }, { data: m }, { data: j }] = await Promise.all([
      supabase.from("seniors").select("*").order("created_at", { ascending: false }),
      supabase.from("matches").select("senior_id, score, status"),
      supabase.from("jobs").select("*").order("created_at", { ascending: false }),
    ]);
    setSeniors(s ?? []);
    setMatches(m ?? []);
    setJobs(j ?? []);
  }

  // 집계
  const unmatchedCount = seniors.filter((s) => getEffectiveStatus(s.id, matches) === "unmatched").length;
  const pendingCount   = seniors.filter((s) => getEffectiveStatus(s.id, matches) === "pending").length;
  const assignedCount  = seniors.filter((s) => getEffectiveStatus(s.id, matches) === "assigned").length;

  // 일자리 추가
  function validateJob(): JobFormErrors {
    const e: JobFormErrors = {};
    if (!form.title.trim()) e.title = "공고명을 입력해 주세요.";
    if (!form.region) e.region = "지역을 선택해 주세요.";
    if (!form.job_type) e.job_type = "직종을 선택해 주세요.";
    return e;
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateJob();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaveStatus("loading");

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        title: form.title.trim(),
        region: form.region,
        job_type: form.job_type,
        required_career: form.required_career ? parseInt(form.required_career) : 0,
      })
      .select("id")
      .single();

    if (error || !data) { setSaveStatus("error"); return; }

    // 매칭 재계산
    await supabase.rpc("recalculate_matches_for_job", { p_job_id: data.id });

    setSaveStatus("success");
    setForm({ title: "", region: "", job_type: "", required_career: "" });
    fetchAll();
    setTimeout(() => setSaveStatus("idle"), 3000);
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

      {/* ── 집계 카드 3개 ── */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {[
          { label: "미매칭 시니어", count: unmatchedCount, color: "bg-red-100 border-red-300",       num: "bg-red-600 text-white",    Icon: AlertTriangle,  iconColor: "text-red-500" },
          { label: "매칭 대기",     count: pendingCount,   color: "bg-yellow-100 border-yellow-300", num: "bg-yellow-500 text-white", Icon: Clock,          iconColor: "text-yellow-500" },
          { label: "배정 완료",     count: assignedCount,  color: "bg-green-100 border-green-300",   num: "bg-green-600 text-white",  Icon: CheckCircle2,   iconColor: "text-green-600" },
        ].map((c) => (
          <Card key={c.label} className={`border-2 ${c.color} shadow-sm`}>
            <CardContent className="flex flex-col items-center py-8">
              <c.Icon className={`w-10 h-10 mb-2 ${c.iconColor}`} />
              <p className="text-xl font-semibold text-gray-700 mb-3">{c.label}</p>
              <span className={`text-5xl font-bold px-6 py-2 rounded-xl ${c.num}`}>{c.count}</span>
              <p className="text-lg text-gray-500 mt-3">명</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── 시니어 목록 테이블 ── */}
      <Card className="border-2 border-gray-200 shadow-sm mb-16">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">
            시니어 목록 ({seniors.length}명)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seniors.length === 0 ? (
            <p className="text-xl text-gray-400 text-center py-8">등록된 시니어가 없습니다.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-lg font-bold text-gray-700">이름</TableHead>
                  <TableHead className="text-lg font-bold text-gray-700">지역</TableHead>
                  <TableHead className="text-lg font-bold text-gray-700">희망 직종</TableHead>
                  <TableHead className="text-lg font-bold text-gray-700">최고 매칭 점수</TableHead>
                  <TableHead className="text-lg font-bold text-gray-700">상태</TableHead>
                  <TableHead className="text-lg font-bold text-gray-700">추천 목록</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seniors.map((s) => {
                  const eff = getEffectiveStatus(s.id, matches);
                  const best = getBestScore(s.id, matches);
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="text-xl font-semibold">{s.name}</TableCell>
                      <TableCell className="text-xl">{s.region}</TableCell>
                      <TableCell className="text-xl">{s.desired_job}</TableCell>
                      <TableCell className="text-xl">
                        <span className={`px-3 py-1 rounded-full font-bold text-lg ${
                          best === 6 ? "bg-yellow-400 text-yellow-900" :
                          best >= 4  ? "bg-green-500 text-white" :
                          best >= 2  ? "bg-gray-400 text-white" :
                                       "bg-gray-200 text-gray-500"
                        }`}>
                          {best}점
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-lg font-semibold ${STATUS_BADGE[eff]}`}>
                          {STATUS_LABEL[eff]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/recommendations?senior_id=${s.id}`}>
                          <Button variant="outline" size="sm" className="text-lg h-10 px-4 border-2">
                            상세 보기
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── 일자리 관리 ── */}
      <h2 className="text-3xl font-bold text-gray-900 mb-6 border-t-2 border-gray-200 pt-10">
        일자리 관리
      </h2>

      <Card className="border-2 border-gray-200 shadow-sm mb-10">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">새 일자리 추가</CardTitle>
        </CardHeader>
        <CardContent>
          {saveStatus === "success" && (
            <div className="mb-6 rounded-xl border-2 border-green-500 bg-green-50 px-6 py-3 text-xl font-semibold text-green-800">
              ✅ 일자리가 등록되었습니다. 매칭이 자동으로 재계산되었습니다.
            </div>
          )}
          {saveStatus === "error" && (
            <div className="mb-6 rounded-xl border-2 border-red-400 bg-red-50 px-6 py-3 text-xl font-semibold text-red-800">
              ❌ 저장 중 오류가 발생했습니다.
            </div>
          )}

          <form onSubmit={handleAddJob} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label className="text-xl font-semibold text-gray-700">
                공고명 <span className="text-red-500">*</span>
              </Label>
              {errors.title && (
                <p className="rounded-lg bg-red-50 border border-red-400 px-4 py-2 text-lg text-red-700">{errors.title}</p>
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
              <div className="flex flex-col gap-2">
                <Label className="text-xl font-semibold text-gray-700">
                  지역 <span className="text-red-500">*</span>
                </Label>
                {errors.region && (
                  <p className="rounded-lg bg-red-50 border border-red-400 px-4 py-2 text-lg text-red-700">{errors.region}</p>
                )}
                <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v ?? "" })}>
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

              <div className="flex flex-col gap-2">
                <Label className="text-xl font-semibold text-gray-700">
                  직종 <span className="text-red-500">*</span>
                </Label>
                {errors.job_type && (
                  <p className="rounded-lg bg-red-50 border border-red-400 px-4 py-2 text-lg text-red-700">{errors.job_type}</p>
                )}
                <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v ?? "" })}>
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
              {saveStatus === "loading" ? "저장 및 매칭 계산 중…" : "일자리 추가"}
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
            <p className="text-xl text-gray-400 text-center py-10">등록된 일자리가 없습니다.</p>
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

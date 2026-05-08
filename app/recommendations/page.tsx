"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

type Job = {
  id: string;
  title: string;
  region: string;
  job_type: string;
  required_career: number;
};

type MatchRow = {
  id: string;
  score: number;
  status: string;
  jobs: Job;
};

type Senior = {
  id: string;
  name: string;
  region: string;
  desired_job: string;
  career_years: number;
};

function scoreBadge(score: number) {
  if (score === 6) return "bg-yellow-400 text-yellow-900";
  if (score >= 4) return "bg-green-500 text-white";
  if (score >= 2) return "bg-gray-400 text-white";
  return "bg-gray-200 text-gray-600";
}

function scoreLabel(score: number) {
  if (score === 6) return "매우 적합";
  if (score >= 4) return "적합";
  if (score >= 2) return "보통";
  return "";
}

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const seniorId = searchParams.get("senior_id");

  const [senior, setSenior] = useState<Senior | null>(null);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seniorId) { setLoading(false); return; }
    fetchData(seniorId);
  }, [seniorId]);

  async function fetchData(id: string) {
    setLoading(true);
    const [{ data: s }, { data: m }] = await Promise.all([
      supabase.from("seniors").select("*").eq("id", id).single(),
      supabase
        .from("matches")
        .select("*, jobs(*)")
        .eq("senior_id", id)
        .gt("score", 0)
        .order("score", { ascending: false }),
    ]);
    setSenior(s ?? null);
    setMatches((m as MatchRow[]) ?? []);
    setLoading(false);
  }

  if (!seniorId) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">자동 매칭 추천 목록</h1>
        <div className="rounded-xl border-2 border-yellow-400 bg-yellow-50 px-6 py-5 text-xl text-yellow-800">
          URL에 시니어 ID가 필요합니다.
          <br />
          <span className="text-lg text-yellow-700 mt-1 block">
            관리자 대시보드의 <strong>"상세 보기"</strong> 버튼을 통해 접근하세요.
          </span>
        </div>
        <Link
          href="/admin"
          className="mt-6 inline-block text-xl font-semibold underline text-gray-700 hover:text-gray-900"
        >
          ← 관리자 대시보드로 이동
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold text-gray-900 mb-3">
        {senior ? `${senior.name} 님께 맞는 일자리` : "맞춤 일자리 추천"}
      </h1>

      {senior && (
        <p className="text-xl text-gray-600 mb-10">
          지역: <span className="font-semibold text-gray-900">{senior.region}</span>
          &nbsp;·&nbsp;직종: <span className="font-semibold text-gray-900">{senior.desired_job}</span>
          &nbsp;·&nbsp;경력: <span className="font-semibold text-gray-900">{senior.career_years}년</span>
        </p>
      )}

      {loading && (
        <p className="text-xl text-gray-400 text-center py-16">불러오는 중…</p>
      )}

      {!loading && matches.length === 0 && (
        <div className="rounded-xl border-2 border-gray-300 bg-gray-50 px-6 py-10 text-center">
          <p className="text-2xl font-semibold text-gray-700 mb-3">
            현재 매칭되는 일자리가 없습니다
          </p>
          <p className="text-xl text-gray-500 mb-1">
            담당자가 직접 연락드리니 잠시만 기다려 주세요.
          </p>
          <p className="text-lg text-gray-400">
            새 일자리가 등록되면 자동으로 재매칭됩니다.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {matches.map((m) => (
          <Card
            key={m.id}
            className="border-2 border-gray-200 hover:border-gray-400 transition-colors shadow-sm"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-2xl text-gray-900">{m.jobs.title}</CardTitle>
                <div className="flex items-center gap-3 shrink-0">
                  {scoreLabel(m.score) && (
                    <span className="text-lg font-medium text-gray-500">{scoreLabel(m.score)}</span>
                  )}
                  <span
                    className={`text-2xl font-bold px-4 py-1 rounded-full ${scoreBadge(m.score)}`}
                  >
                    {m.score}점
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6 text-xl text-gray-600">
                <span>
                  <span className="font-semibold text-gray-800">지역:</span> {m.jobs.region}
                </span>
                <span>
                  <span className="font-semibold text-gray-800">직종:</span> {m.jobs.job_type}
                </span>
                <span>
                  <span className="font-semibold text-gray-800">요구 경력:</span>{" "}
                  {m.jobs.required_career}년 이상
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Link
        href="/admin"
        className="mt-10 inline-block text-xl font-semibold underline text-gray-600 hover:text-gray-900"
      >
        ← 관리자 대시보드로 돌아가기
      </Link>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={<p className="text-xl text-center py-20 text-gray-400">불러오는 중…</p>}>
      <RecommendationsContent />
    </Suspense>
  );
}

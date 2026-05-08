# PRD — 상상우리 시니어 일자리 자동 매칭 시스템

**버전:** 1.0  
**작성일:** 2026-05-08  
**프로젝트:** sangsangwoori-matching  
**배포 URL:** https://sangsangwoori-matching.vercel.app  
**GitHub:** https://github.com/revibecampus-Ella/sangsangwoori-matching

---

## 1. 개요

시니어가 일자리 신청 폼을 제출하면, 등록된 일자리와 규칙 기반 점수를 자동 계산하여 담당자 대시보드에 추천 목록을 표시하는 웹 시스템.

AI API 없이 단순 덧셈 규칙으로 매칭 점수를 산출하며, 담당자가 시니어별 적합 공고를 빠르게 확인하고 연락할 수 있도록 지원한다.

---

## 2. 배경 및 목적

- 시니어 일자리 연결 업무를 담당하는 상상우리 팀이 수기로 처리하던 매칭 작업을 자동화
- 지역·직종·경력 조건을 즉시 계산해 담당자의 업무 부담을 줄이고 시니어에게 빠른 안내 제공
- 학습 환경 프로토타입으로, 이후 실서비스 전환 시 인증·권한·RLS 설계가 필요함

---

## 3. 사용자 및 역할

| 역할 | 설명 | 주요 진입점 |
|---|---|---|
| **시니어** | 일자리를 찾는 사용자. 디지털 친숙도가 낮을 수 있음 | `/register` |
| **담당자** | 매칭 결과를 확인하고 시니어에게 연락하는 내부 직원 | `/admin`, `/recommendations` |

---

## 4. 핵심 기능

### 4-1. 시니어 프로필 등록 (`/register`)
- 이름, 지역, 희망 직종, 경력(년) 입력
- 필수 필드(이름·지역·희망 직종) 누락 시 해당 필드 위에 빨간 안내 박스, 저장 차단
- 제출 성공 시 초록 박스 "등록이 완료되었습니다. 담당자가 곧 연락드립니다" 표시 후 폼 초기화
- 등록 즉시 `recalculate_matches_for_senior` RPC 자동 호출 → matches 테이블 갱신

### 4-2. 자동 매칭 추천 목록 (`/recommendations?senior_id={uuid}`)
- 해당 시니어의 matches 레코드를 점수 내림차순 카드 형태로 표시
- 점수 배지: 6점=금색(매우 적합) / 4~5점=녹색(적합) / 2~3점=회색(보통)
- score=0인 레코드는 필터링 (표시 안 함)
- 모든 일자리와 score=0인 경우: "현재 매칭되는 일자리가 없습니다. 담당자가 직접 연락드리니 잠시만 기다려 주세요" 안내 박스

### 4-3. 담당자 대시보드 (`/admin`)
- **집계 카드 3개**: 미매칭 시니어 수(⚠️) / 매칭 대기(🕐) / 배정 완료(✅)
- **시니어 목록 테이블**: 이름·지역·희망 직종·최고 매칭 점수 배지·상태 배지·"상세 보기" 버튼
  - "상세 보기" → `/recommendations?senior_id={uuid}`로 이동
- **일자리 관리 섹션**:
  - 새 일자리 추가 폼 (공고명·지역·직종·요구 경력)
  - 등록된 일자리 목록 테이블 + 삭제 버튼
  - 일자리 추가 시 `recalculate_matches_for_job` RPC 자동 호출

---

## 5. 매칭 규칙

AI API 없이 단순 덧셈. 최대 6점.

| 조건 | 점수 |
|---|---|
| 시니어 지역 == 일자리 지역 (정규화 후 비교) | +3 |
| 시니어 희망 직종 == 일자리 직종 (정규화 후 비교) | +2 |
| 시니어 경력(년) ≥ 일자리 요구 경력 | +1 |

### 지역 정규화 (비교용, 원본 수정 없음)
| 입력값 | 정규화 |
|---|---|
| 서울특별시 | 서울 |
| 경기도 | 경기 |
| 인천광역시 | 인천 |

### 직종 정규화 (비교용, 원본 수정 없음)
| 입력값 | 정규화 |
|---|---|
| 경비직 | 경비 |
| 청소직 | 청소 |
| 조리직 | 조리 |
| 돌봄직 | 돌봄 |

### 자동 재계산 트리거
- seniors INSERT → `recalculate_matches_for_senior(senior_id)`: 해당 시니어 × 전체 일자리
- jobs INSERT → `recalculate_matches_for_job(job_id)`: 해당 일자리 × 전체 시니어
- ON CONFLICT (senior_id, job_id) DO UPDATE SET score — 중복 없이 UPSERT

---

## 6. 데이터 모델

### seniors
| 컬럼 | 타입 | 제약 |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| name | text | NOT NULL |
| region | text | NOT NULL |
| desired_job | text | NOT NULL |
| career_years | integer | NOT NULL, default 0 |
| created_at | timestamptz | default now() |

### jobs
| 컬럼 | 타입 | 제약 |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| title | text | NOT NULL |
| region | text | NOT NULL |
| job_type | text | NOT NULL |
| required_career | integer | NOT NULL, default 0 |
| created_at | timestamptz | default now() |

### matches
| 컬럼 | 타입 | 제약 |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| senior_id | uuid | FK → seniors(id) ON DELETE CASCADE |
| job_id | uuid | FK → jobs(id) ON DELETE CASCADE |
| score | numeric(5,2) | NOT NULL, default 0 |
| status | text | NOT NULL, default 'pending' |
| created_at | timestamptz | default now() |
| — | — | UNIQUE(senior_id, job_id) |

### status 값
| 값 | 의미 |
|---|---|
| pending | 매칭 대기 (기본값) |
| assigned | 배정 완료 |
| done | 처리 완료 |

### Supabase RPC 함수
| 함수명 | 동작 |
|---|---|
| `recalculate_matches_for_senior(p_senior_id uuid)` | 1명 시니어 × 전체 일자리 점수 UPSERT |
| `recalculate_matches_for_job(p_job_id uuid)` | 1개 일자리 × 전체 시니어 점수 UPSERT |
| `normalize_region(r text)` | 지역 정규화 헬퍼 (IMMUTABLE) |
| `normalize_job_type(j text)` | 직종 정규화 헬퍼 (IMMUTABLE) |

---

## 7. 화면별 스펙

### /register
- 제목: "시니어 일자리 신청하기"
- 각 필드 위 안내 문구: "성함이 어떻게 되세요?" / "어디에서 일하고 싶으세요?" / "어떤 일을 하시겠어요?" / "일하신 경험이 몇 년이나 되세요?"
- 지역 드롭다운: 서울 / 경기 / 인천 / 기타
- 희망 직종 드롭다운: 경비 / 청소 / 조리 / 돌봄 / 기타
- 버튼 "신청하기" (h-16, bg-gray-900)
- 성공: 초록 박스 (border-green-500, bg-green-50)
- 실패: 빨간 박스 (border-red-400, bg-red-50) — 필드별 개별 표시

### /recommendations
- 제목: "{이름} 님께 맞는 일자리"
- 부제: 지역·직종·경력 요약
- 카드당: 공고명 / 지역 / 직종 / 요구 경력 / 점수 배지 + 의미 라벨
- 빈 상태: "현재 매칭되는 일자리가 없습니다 / 담당자가 직접 연락드리니 잠시만 기다려 주세요"

### /admin
- 집계 카드: lucide-react 아이콘(AlertTriangle / Clock / CheckCircle2) + 색상 배경
- 시니어 상태 로직:
  - unmatched: matches 없거나 전부 score=0
  - pending: score>0 매칭 있고 assigned/done 없음
  - assigned: status='assigned' 또는 'done' 매칭 존재
- 일자리 삭제: `DELETE FROM jobs WHERE id=?`

---

## 8. 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 16.2.4 (App Router, Turbopack) |
| 언어 | TypeScript 5 |
| 스타일 | Tailwind CSS v4 + shadcn/ui (Base UI 기반) |
| 아이콘 | lucide-react |
| 데이터베이스 | Supabase (PostgreSQL, ap-northeast-2 서울) |
| ORM/Client | @supabase/supabase-js |
| 배포 | Vercel (GitHub 자동 배포) |
| 테스트 | @playwright/test — E2E 3종 |

---

## 9. E2E 테스트

`tests/` 디렉터리, `npx playwright test` 실행.

| 파일 | 시나리오 | 검증 항목 |
|---|---|---|
| `normal.spec.ts` | 정상 등록 (서울/경비/5년, 서울/경비/요구3년 공고) | 성공 메시지 + 6점 금색 배지 |
| `invalid.spec.ts` | 이름 누락 제출 | 빨간 안내 박스 + seniors 테이블 저장 차단 |
| `no-match.spec.ts` | 지역·직종·경력 전부 불일치 (score=0) | "현재 매칭되는 일자리가 없습니다" 박스 |

- `beforeEach`: DB 전체 초기화 → 테스트용 데이터 세팅
- **주의**: `beforeEach`가 실제 DB를 초기화하므로 시연 데이터 보호 필요. 명시적 요청 시에만 실행.

---

## 10. 비기능 요구사항

| 항목 | 기준 |
|---|---|
| 접근성 | 기본 글자 18px 이상, 버튼 높이 48px 이상, 고대비 배경·텍스트 |
| 반응성 | max-width 중앙 정렬, 모바일 기본 지원 |
| 성능 | Supabase RPC 1회 호출로 전체 매칭 계산 완료 |
| 보안 | 학습 환경 — RLS 비활성화. 실서비스 전 반드시 RLS 정책 재설계 필요 |

---

## 11. 제약 및 한계

- **AI API 사용 없음** — 모든 매칭은 규칙 기반 덧셈
- **RLS 비활성화** — anon key로 전체 읽기·쓰기 가능. 실서비스 금지
- **인증 없음** — 담당자 로그인, 시니어 본인 확인 미구현
- **status 변경 UI 없음** — matches.status(assigned/done) 변경은 DB 직접 조작 필요
- 정규화 규칙이 코드(RPC 함수)에 하드코딩 — 추가 이형어 발생 시 마이그레이션 필요

---

## 12. 배포 정보

| 항목 | 값 |
|---|---|
| 프로덕션 URL | https://sangsangwoori-matching.vercel.app |
| GitHub | https://github.com/revibecampus-Ella/sangsangwoori-matching |
| Supabase 프로젝트 ID | pxszsmqsitnxfveszroc |
| Supabase URL | https://pxszsmqsitnxfveszroc.supabase.co |
| Region | ap-northeast-2 (서울) |
| Vercel 환경변수 | NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY |

### 로컬 개발
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드 검증
npx playwright test  # E2E 테스트 (DB 초기화 주의)
```

---

## 13. 향후 개선 과제

| 우선순위 | 항목 |
|---|---|
| 높음 | RLS 정책 설계 + 담당자 로그인(Supabase Auth) |
| 높음 | matches.status 변경 UI (담당자가 "배정 완료" 처리) |
| 중간 | 시니어에게 SMS/알림 발송 연동 |
| 중간 | 정규화 규칙 테이블화 (DB에서 관리) |
| 낮음 | 매칭 점수 가중치 관리자 설정 화면 |
| 낮음 | 시니어 프로필 수정·삭제 기능 |

import { test, expect, type Page } from '@playwright/test';
import { resetDB, insertJob, getLatestSeniorId } from './helpers/db';

async function fillRegisterForm(
  page: Page,
  opts: { name: string; region: string; job: string; career: string }
) {
  await page.getByPlaceholder('성함을 입력해 주세요').fill(opts.name);

  await page.getByRole('combobox').filter({ hasText: '지역을 선택해 주세요' }).click();
  await page.getByRole('option', { name: opts.region }).click();

  await page.getByRole('combobox').filter({ hasText: '직종을 선택해 주세요' }).click();
  await page.getByRole('option', { name: opts.job }).click();

  await page.getByPlaceholder('예: 5 (없으면 0)').fill(opts.career);
}

test.beforeEach(async () => {
  await resetDB();
  // 지역·직종 불일치 + 요구 경력 초과(10년) → 3가지 조건 모두 실패 → score = 0
  await insertJob({ title: '기타 직종 공고', region: '기타', job_type: '기타', required_career: 10 });
});

test('매칭 없는 시니어 → 추천 목록에 안내 박스 표시', async ({ page }) => {
  await page.goto('/register');

  // 서울/경비/3년 시니어 등록 (기타/기타/10년 공고와 score=0)
  await fillRegisterForm(page, { name: '매칭없음시니어', region: '서울', job: '경비', career: '3' });
  await page.getByRole('button', { name: '등록하기' }).click();

  await expect(page.getByText('등록이 완료되었습니다')).toBeVisible({ timeout: 15_000 });

  // 추천 목록 → 안내 박스 확인
  const seniorId = await getLatestSeniorId();
  await page.goto(`/recommendations?senior_id=${seniorId}`);

  await expect(page.getByText('현재 매칭되는 일자리가 없습니다')).toBeVisible({ timeout: 10_000 });
});

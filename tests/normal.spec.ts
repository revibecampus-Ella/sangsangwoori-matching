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
  // 서울/경비/요구경력 3년 공고 세팅
  await insertJob({ title: '서울 경비원 모집', region: '서울', job_type: '경비', required_career: 3 });
});

test('정상 등록 → 성공 메시지 + 6점 금색 배지 카드 표시', async ({ page }) => {
  await page.goto('/register');

  // 이름 "테스트시니어" / 지역 "서울" / 직종 "경비" / 경력 5년
  await fillRegisterForm(page, { name: '테스트시니어', region: '서울', job: '경비', career: '5' });
  await page.getByRole('button', { name: '등록하기' }).click();

  // 1) 성공 메시지 확인
  await expect(page.getByText('등록이 완료되었습니다')).toBeVisible({ timeout: 15_000 });

  // 2) 추천 목록에서 6점 배지 확인
  const seniorId = await getLatestSeniorId();
  await page.goto(`/recommendations?senior_id=${seniorId}`);

  await expect(page.getByText('6점')).toBeVisible({ timeout: 10_000 });
});

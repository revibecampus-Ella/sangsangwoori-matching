import { test, expect } from '@playwright/test';
import { resetDB, getSeniorsCount } from './helpers/db';

test.beforeEach(async () => {
  await resetDB();
});

test('이름 누락 → 빨간 안내 박스 표시 + DB 저장 차단', async ({ page }) => {
  await page.goto('/register');

  // 이름은 비운 채로 지역·직종·경력만 입력
  await page.getByRole('combobox').filter({ hasText: '지역을 선택해 주세요' }).click();
  await page.getByRole('option', { name: '서울' }).click();

  await page.getByRole('combobox').filter({ hasText: '직종을 선택해 주세요' }).click();
  await page.getByRole('option', { name: '경비' }).click();

  await page.getByPlaceholder('예: 5 (없으면 0)').fill('3');

  await page.getByRole('button', { name: '등록하기' }).click();

  // 1) 이름 필드 위 빨간 안내 박스
  await expect(page.getByText('이름을 입력해 주세요.')).toBeVisible();

  // 2) seniors 테이블에 새 레코드 없음
  const count = await getSeniorsCount();
  expect(count).toBe(0);
});

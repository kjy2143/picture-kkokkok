import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { DifferencePuzzle, HiddenPuzzle } from "../../src/types";

const differenceId = "daily-easy-jua-family-picnic";
const hiddenId = "hidden-daily-easy-jua-family-workshop";
const difference: DifferencePuzzle = JSON.parse(
  readFileSync(`content/games/${differenceId}/puzzle.json`, "utf8"),
);
const hidden: HiddenPuzzle = JSON.parse(
  readFileSync(`content/games/${hiddenId}/puzzle.json`, "utf8"),
);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("kkokkok-play-help-seen", "true"),
  );
});

test("주아 가족 소풍의 양쪽 정답 7개·재시작·완료 복원", async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 1180, height: 820 });
  await page.goto(`/?game=${differenceId}`);
  await expect(
    page.getByRole("heading", { name: "주아 가족의 가을 소풍" }),
  ).toBeVisible();
  await expect(page.locator("svg.board")).toHaveCount(2);
  if (browserName === "chromium")
    await page.screenshot({
      path: "work/family-content/differences-landscape.png",
    });
  await page.setViewportSize({ width: 820, height: 1180 });
  if (browserName === "chromium")
    await page.screenshot({
      path: "work/family-content/differences-portrait.png",
    });
  await page.setViewportSize({ width: 1180, height: 820 });
  for (const side of ["left", "right"] as const) {
    const board = page.locator("svg.board").nth(side === "left" ? 0 : 1);
    for (let i = 0; i < difference.differences.length; i++) {
      const box = await board.boundingBox();
      const area = difference.differences[i][side];
      await page.mouse.click(
        box!.x + box!.width * area.x,
        box!.y + box!.height * area.y,
      );
      await expect(page.locator(".answer-ring")).toHaveCount((i + 1) * 2);
      if (i === 0) {
        await page.mouse.click(
          box!.x + box!.width * area.x,
          box!.y + box!.height * area.y,
        );
        await expect(page.locator(".answer-ring")).toHaveCount(2);
        await page.getByRole("button", { name: "힌트", exact: true }).click();
        await expect(page.locator(".hint-ring")).toHaveCount(2);
        await expect(page.locator(".answer-ring")).toHaveCount(2);
      }
    }
    await expect(
      page.getByRole("dialog", { name: "모두 찾았어요!" }),
    ).toBeVisible();
    if (side === "left") {
      await page.getByRole("button", { name: "그림 더 보기" }).click();
      await page
        .getByRole("button", { name: "다시 풀기", exact: true })
        .click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "다시 풀기", exact: true })
        .click();
      await expect(page.locator(".answer-ring")).toHaveCount(0);
    }
  }
  await page.reload();
  await expect(
    page.getByRole("dialog", { name: "모두 찾았어요!" }),
  ).toBeVisible();
  await expect(page.locator(".answer-ring")).toHaveCount(14);
});

test("주아 가족 공방의 투명 목표 7개·가로세로 판정·저장·재시작", async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 1180, height: 820 });
  await page.goto(`/?game=${hiddenId}`);
  await expect(
    page.getByRole("heading", { name: "주아 가족의 주말 공방" }),
  ).toBeVisible();
  await expect(page.locator(".target-list li")).toHaveCount(7);
  await expect
    .poll(() =>
      page
        .locator(".target-list img")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              (image as HTMLImageElement).complete &&
              (image as HTMLImageElement).naturalWidth >= 96,
          ),
        ),
    )
    .toBe(true);
  if (browserName === "chromium")
    await page.screenshot({ path: "work/family-content/hidden-landscape.png" });
  await page.getByRole("button", { name: "힌트", exact: true }).click();
  await expect(page.locator(".hint-ring")).toHaveCount(1);
  await expect(page.locator(".answer-ring")).toHaveCount(0);
  await page.setViewportSize({ width: 820, height: 1180 });
  if (browserName === "chromium")
    await page.screenshot({ path: "work/family-content/hidden-portrait.png" });
  for (let i = 0; i < hidden.targets.length; i++) {
    if (i === 3) {
      await page.reload();
      await expect(page.locator(".answer-ring")).toHaveCount(3);
      await page.setViewportSize({ width: 1180, height: 820 });
    }
    const box = await page.locator("svg.board").boundingBox();
    const area = hidden.targets[i].area;
    await page.mouse.click(
      box!.x + box!.width * area.x,
      box!.y + box!.height * area.y,
    );
    await expect(page.locator(".answer-ring")).toHaveCount(i + 1);
    await expect(page.locator(".target-found")).toHaveCount(i + 1);
    if (i === 0) {
      await page.mouse.click(
        box!.x + box!.width * area.x,
        box!.y + box!.height * area.y,
      );
      await expect(page.locator(".answer-ring")).toHaveCount(1);
    }
  }
  await expect(
    page.getByRole("dialog", { name: "모두 찾았어요!" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "그림 더 보기" }).click();
  await page.getByRole("button", { name: "다시 풀기", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "다시 풀기", exact: true })
    .click();
  await expect(page.locator(".answer-ring")).toHaveCount(0);
  await expect(page.locator(".target-found")).toHaveCount(0);
});

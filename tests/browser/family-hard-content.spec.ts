import { test, expect, type Page, type Locator } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { DifferencePuzzle, HiddenPuzzle } from "../../src/types";

const output = "work/family-content/hard-expansion-20261029";
const differences = ["camping", "bakery", "seaside"].map(
  (s) => `daily-hard-jua-family-${s}`,
);
const hidden = ["library", "aquarium", "attic"].map(
  (s) => `hidden-daily-hard-jua-family-${s}`,
);
const read = (id: string) =>
  JSON.parse(readFileSync(`content/games/${id}/puzzle.json`, "utf8"));
const click = async (
  page: Page,
  board: Locator,
  area: { x: number; y: number },
) => {
  const box = await board.boundingBox();
  await page.mouse.click(
    box!.x + box!.width * area.x,
    box!.y + box!.height * area.y,
  );
};
// UI feedback precedes the asynchronous IndexedDB write. Reload only after the
// persisted count is observable; this test checks restoration of saved progress.
const waitStored = async (page: Page, id: string, count: number) => {
  await expect
    .poll(() =>
      page.evaluate(
        async (gameId) =>
          new Promise<number>((resolve, reject) => {
            const request = indexedDB.open("kkokkok", 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
              const db = request.result;
              const tx = db.transaction("progress", "readonly");
              const saved = tx.objectStore("progress").get(gameId);
              tx.oncomplete = () => {
                db.close();
                resolve(saved.result?.found.length ?? 0);
              };
              tx.onerror = () => {
                db.close();
                reject(tx.error);
              };
            };
          }),
        id,
      ),
    )
    .toBe(count);
};
const restart = async (page: Page) => {
  await page.getByRole("button", { name: "다시 풀기", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "다시 풀기", exact: true })
    .click();
  await expect(page.locator(".answer-ring")).toHaveCount(0);
};
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("kkokkok-play-help-seen", "true"),
  );
  await page.setViewportSize({ width: 1180, height: 820 });
});

for (const id of differences)
  test(`${id}: 양쪽 10개·힌트·중복·재시작·복원`, async ({
    page,
    browserName,
  }) => {
    const puzzle = read(id) as DifferencePuzzle;
    await page.goto(`/?game=${id}`);
    await expect(page.locator("svg.board")).toHaveCount(2);
    if (browserName === "chromium")
      await page.screenshot({ path: `${output}/${id}-landscape.png` });
    await page.setViewportSize({ width: 820, height: 1180 });
    await expect(page.locator("svg.board")).toHaveCount(2);
    if (browserName === "chromium")
      await page.screenshot({ path: `${output}/${id}-portrait.png` });
    await page.setViewportSize({ width: 1180, height: 820 });
    for (const side of ["left", "right"] as const) {
      const board = page.locator("svg.board").nth(side === "left" ? 0 : 1);
      for (let i = 0; i < 10; i++) {
        if (i === 3) {
          await waitStored(page, id, 3);
          await page.reload();
          await expect(page.locator(".answer-ring")).toHaveCount(6);
        }
        await click(page, board, puzzle.differences[i][side]);
        await expect(page.locator(".answer-ring")).toHaveCount((i + 1) * 2);
        if (i === 0) {
          await click(page, board, puzzle.differences[i][side]);
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
        await restart(page);
      }
    }
    await waitStored(page, id, 10);
    await page.reload();
    await expect(
      page.getByRole("dialog", { name: "모두 찾았어요!" }),
    ).toBeVisible();
    await expect(page.locator(".answer-ring")).toHaveCount(20);
  });

for (const id of hidden)
  test(`${id}: 투명 목표 10개·가로세로·중복·힌트·재시작·복원`, async ({
    page,
    browserName,
  }) => {
    const puzzle = read(id) as HiddenPuzzle;
    await page.goto(`/?game=${id}`);
    await expect(page.locator("svg.board")).toHaveCount(1);
    await expect(page.locator(".target-list li")).toHaveCount(10);
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
      await page.screenshot({ path: `${output}/${id}-landscape.png` });
    await page.getByRole("button", { name: "힌트", exact: true }).click();
    await expect(page.locator(".hint-ring")).toHaveCount(1);
    await expect(page.locator(".answer-ring")).toHaveCount(0);
    await click(page, page.locator("svg.board"), puzzle.targets[0].area);
    await expect(page.locator(".target-found")).toHaveCount(1);
    await restart(page);
    for (const size of [
      { width: 820, height: 1180 },
      { width: 1180, height: 820 },
    ]) {
      await page.setViewportSize(size);
      if (browserName === "chromium" && size.width === 820)
        await page.screenshot({ path: `${output}/${id}-portrait.png` });
      for (let i = 0; i < 10; i++) {
        if (i === 3) {
          await waitStored(page, id, 3);
          await page.reload();
          await expect(page.locator(".answer-ring")).toHaveCount(3);
        }
        await click(page, page.locator("svg.board"), puzzle.targets[i].area);
        await expect(page.locator(".answer-ring")).toHaveCount(i + 1);
        await expect(page.locator(".target-found")).toHaveCount(i + 1);
        if (i === 0) {
          await click(page, page.locator("svg.board"), puzzle.targets[i].area);
          await expect(page.locator(".answer-ring")).toHaveCount(1);
        }
      }
      await expect(
        page.getByRole("dialog", { name: "모두 찾았어요!" }),
      ).toBeVisible();
      await waitStored(page, id, 10);
      await page.reload();
      await expect(page.locator(".answer-ring")).toHaveCount(10);
      await page.getByRole("button", { name: "그림 더 보기" }).click();
      await restart(page);
      await expect(page.locator(".target-found")).toHaveCount(0);
    }
  });

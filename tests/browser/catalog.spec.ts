import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { check, themes, counts } from "../../scripts/content.mjs";

test("등록 게임의 기본 주제·난이도 구성·양쪽 정답 판정", async ({
  browser,
  browserName,
}) => {
  test.setTimeout(180000);
  const games = (await check()).filter((g) => g.puzzle.kind !== "hidden");
  expect(games.length).toBeGreaterThanOrEqual(18);
  for (const theme of themes)
    for (const difficulty of Object.keys(counts)) {
      expect(
        games.filter(
          (g) => g.meta.theme === theme && g.meta.difficulty === difficulty,
        ).length,
      ).toBeGreaterThanOrEqual(1);
    }
  for (const game of games) {
    expect(game.puzzle.width / game.puzzle.height).toBeCloseTo(4 / 5, 5);
    const context = await browser.newContext({
      viewport: { width: 1180, height: 820 },
    });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:4173/?game=${game.id}`);
    await expect(page.locator("svg.board")).toHaveCount(2);
    const sources = await page
      .locator("svg.board image")
      .evaluateAll((es) => es.map((e) => e.getAttribute("href")));
    for (const source of sources)
      expect((await page.request.get(source!)).ok()).toBe(true);
    if (browserName === "chromium") {
      await fs.mkdir(`work/content/${game.id}`, { recursive: true });
      await page.screenshot({
        path: `work/content/${game.id}/game-landscape.png`,
      });
      await page.setViewportSize({ width: 820, height: 1180 });
      await page.screenshot({
        path: `work/content/${game.id}/game-portrait.png`,
      });
      await page.setViewportSize({ width: 1180, height: 820 });
    }
    for (let i = 0; i < game.puzzle.differences.length; i++) {
      const side = i % 2,
        a = game.puzzle.differences[i][side ? "right" : "left"];
      const box = await page.locator("svg.board").nth(side).boundingBox();
      await page.mouse.click(
        box!.x + box!.width * a.x,
        box!.y + box!.height * a.y,
      );
      await expect(page.locator(".answer-ring")).toHaveCount((i + 1) * 2);
    }
    await expect(
      page.getByRole("heading", { name: "모두 찾았어요!" }),
    ).toBeVisible();
    await context.close();
  }
});

import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { check } from "../../scripts/content.mjs";
const hiddenId = "hidden-animals-easy-01";
const readCatalog = async (page: any) => {
  const value = await (await page.request.get("/catalog.json")).json();
  return { ...value, games: [...value.games, ...(value.hiddenGames || [])] };
};
const load = async (id = hiddenId) =>
  JSON.parse(await fs.readFile(`content/games/${id}/puzzle.json`, "utf8"));
const dismiss = async (page: any) => {
  const close = page.getByRole("button", { name: "놀이 안내 닫기" });
  if (await close.isVisible()) await close.click();
};
async function choose(page: any, area: { x: number; y: number }) {
  const box = await page.locator("svg.board").boundingBox();
  await page.mouse.click(
    box.x + box.width * area.x,
    box.y + box.height * area.y,
  );
}
test("첫 화면에서 놀이를 선택하고 해당 목록으로 들어간다", async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 1180, height: 820 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "오늘은 어떤 놀이를 할까?" }),
  ).toBeVisible();
  await expect(page.locator(".mode-choice")).toHaveCount(2);
  await expect
    .poll(() =>
      page
        .locator(".mode-choice img")
        .evaluateAll(
          (images) =>
            images.length >= 3 &&
            images.every(
              (image) =>
                (image as HTMLImageElement).complete &&
                (image as HTMLImageElement).naturalWidth > 0,
            ),
        ),
    )
    .toBe(true);
  if (browserName === "chromium") {
    await page.screenshot({
      path: ".impeccable/review/hidden-mode-selection.png",
    });
    await page.setViewportSize({ width: 1505, height: 1045 });
    await page.screenshot({ path: ".impeccable/review/comp-mode.png" });
    await page.setViewportSize({ width: 1180, height: 820 });
  }
  await page.locator(".hidden-choice").click();
  await expect(page).toHaveURL(/mode=hidden/);
  await expect(
    page.getByRole("heading", { name: "숨은그림찾기", exact: true }),
  ).toBeVisible();
  const catalog = await readCatalog(page);
  await expect(page.locator(".game-card")).toHaveCount(
    catalog.games.filter((g: any) => g.kind === "hidden").length,
  );
  await expect
    .poll(() =>
      page
        .locator(".game-card img")
        .evaluateAll((images) =>
          images
            .filter((image) => image.getBoundingClientRect().top < innerHeight)
            .every(
              (image) =>
                (image as HTMLImageElement).complete &&
                (image as HTMLImageElement).naturalWidth > 0,
            ),
        ),
    )
    .toBe(true);
  if (browserName === "chromium") {
    await page.screenshot({ path: ".impeccable/review/hidden-library.png" });
    await page.setViewportSize({ width: 1505, height: 1045 });
    await page.screenshot({ path: ".impeccable/review/comp-library.png" });
    await page.setViewportSize({ width: 1180, height: 820 });
  }
  await page.getByRole("button", { name: "놀이 선택", exact: true }).click();
  await page.locator(".difference-choice").click();
  await expect(page).toHaveURL(/mode=differences/);
  await expect(page.locator(".game-card")).toHaveCount(
    catalog.games.filter((g: any) => g.kind !== "hidden").length,
  );
});
test("단일 그림의 정답·중복 선택·저장·힌트·복귀·다시 풀기가 연결된다", async ({
  page,
}) => {
  const puzzle = await load();
  await page.goto(`/?game=${hiddenId}`);
  await expect(page.locator("svg.board")).toHaveCount(1);
  await dismiss(page);
  await expect(page.locator(".target-list li")).toHaveCount(7);
  await choose(page, puzzle.targets[0].area);
  await choose(page, puzzle.targets[0].area);
  await expect(page.locator(".answer-ring")).toHaveCount(1);
  await expect(page.locator(".target-found")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".answer-ring")).toHaveCount(1);
  await dismiss(page);
  await page.getByRole("button", { name: "힌트", exact: true }).click();
  await expect(page.locator(".hint-ring")).toHaveCount(1);
  await expect(page.locator(".answer-ring")).toHaveCount(1);
  await expect(page.locator(".target-hint")).toHaveCount(1);
  await page.getByRole("button", { name: "다른 그림", exact: true }).click();
  await expect(page).toHaveURL(/mode=hidden/);
  await expect(page.locator("svg.board")).toHaveCount(0);
  await page
    .getByRole("button", { name: new RegExp("토끼의 작은 정원") })
    .click();
  await expect(page.locator(".answer-ring")).toHaveCount(1);
  await page.getByRole("button", { name: "다시 풀기", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "다시 풀기", exact: true }).click();
  await expect(page.locator(".answer-ring")).toHaveCount(0);
  await expect(page.locator(".target-found")).toHaveCount(0);
  await expect(page.locator(".hint-ring")).toHaveCount(0);
});
test("숨은그림의 뒤로가기·앞으로가기·새로고침이 종류와 진행을 유지한다", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".hidden-choice").click();
  await page.locator(".game-card").first().click();
  const url = page.url();
  await expect(page.locator("svg.board")).toHaveCount(1);
  await page.goBack();
  await expect(page).toHaveURL(/mode=hidden$/);
  await expect(page.locator(".game-card").first()).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(url);
  await expect(page.locator("svg.board")).toHaveCount(1);
  await page.reload();
  await expect(page.locator("svg.board")).toHaveCount(1);
  await page.getByRole("button", { name: "다른 그림", exact: true }).click();
  await expect(page).toHaveURL(/mode=hidden$/);
  await page.goBack();
  await expect(page.locator(".mode-selection")).toBeVisible();
});
test("목표 파일까지 저장된 숨은그림은 오프라인에서 복원된다", async ({
  page,
  context,
}) => {
  await page.goto("/?mode=hidden");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.getByRole("button", { name: /토끼의 작은 정원/ }).click();
  await expect(page.locator("svg.board")).toHaveCount(1);
  await page.getByRole("button", { name: "다른 그림", exact: true }).click();
  const card = page.getByRole("button", { name: /토끼의 작은 정원/ });
  await expect(card).toContainText("오프라인 가능");
  await context.setOffline(true);
  await page.reload();
  await card.click();
  await expect(page.locator("svg.board")).toHaveCount(1);
  await expect
    .poll(() =>
      page
        .locator(".target-list img")
        .evaluateAll((images: any) =>
          images.every((img: any) => img.complete && img.naturalWidth > 0),
        ),
    )
    .toBe(true);
  await context.setOffline(false);
  await page.getByRole("button", { name: "다른 그림", exact: true }).click();
  const catalog = await readCatalog(page);
  const g = catalog.games.find((g: any) => g.id === hiddenId);
  await page.evaluate(async (url: string) => {
    const cache = await caches.open("kkokkok-games-v1");
    await cache.delete(url);
  }, g.targetImages[0]);
  await page.reload();
  await expect(card).not.toContainText("오프라인 가능");
});
test("가로·세로·휴대폰에서 본그림과 모든 목표가 잘리지 않는다", async ({
  page,
  browserName,
}) => {
  for (const viewport of [
    { width: 1180, height: 820 },
    { width: 1024, height: 768 },
    { width: 820, height: 1180 },
    { width: 390, height: 844 },
    { width: 1505, height: 1045 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`/?game=${hiddenId}`);
    await expect(page.locator("svg.board")).toHaveCount(1);
    await dismiss(page);
    const layout = await page.evaluate(() => {
      const b = document.querySelector(".board")!.getBoundingClientRect(),
        p = document.querySelector(".hidden-targets")!.getBoundingClientRect();
      return {
        board: {
          x: b.x,
          y: b.y,
          right: b.right,
          bottom: b.bottom,
          width: b.width,
          height: b.height,
        },
        panel: { x: p.x, y: p.y, right: p.right, bottom: p.bottom },
        overflow: document.documentElement.scrollWidth > innerWidth,
        targets: [...document.querySelectorAll(".target-list li")].map((e) => ({
          width: e.getBoundingClientRect().width,
          height: e.getBoundingClientRect().height,
        })),
      };
    });
    expect(layout.overflow).toBe(false);
    expect(layout.board.width).toBeGreaterThan(250);
    expect(layout.targets.every((t) => t.width > 50 && t.height > 60)).toBe(
      true,
    );
    if (viewport.width > viewport.height) {
      expect(layout.panel.x).toBeGreaterThanOrEqual(layout.board.right);
      expect(layout.panel.bottom).toBeLessThanOrEqual(viewport.height);
    } else expect(layout.panel.y).toBeGreaterThanOrEqual(layout.board.bottom);
    if (browserName === "chromium")
      await page.screenshot({
        path: `.impeccable/review/hidden-play-${viewport.width}.png`,
        fullPage: true,
      });
  }
});
test("등록된 모든 숨은그림의 목표와 완료 판정", async ({
  browser,
  browserName,
}) => {
  test.setTimeout(240000);
  const catalog = JSON.parse(await fs.readFile("public/catalog.json", "utf8"));
  const exported = new Set(
    [...catalog.games, ...(catalog.hiddenGames || [])].map(
      (g: { id: string }) => g.id,
    ),
  );
  const games = (await check()).filter(
    (g) => g.puzzle.kind === "hidden" && exported.has(g.id),
  );
  expect(games.length).toBeGreaterThan(0);
  for (const game of games) {
    const context = await browser.newContext({
      viewport: { width: 1180, height: 820 },
    });
    await context.addInitScript(() =>
      localStorage.setItem("kkokkok-play-help-seen", "true"),
    );
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:4173/?game=${game.id}`);
    await expect(page.locator("svg.board")).toHaveCount(1);
    await expect(page.locator(".target-list li")).toHaveCount(
      game.puzzle.targets.length,
    );
    if (browserName === "chromium") {
      await fs.mkdir(`work/hidden-content/${game.id}`, { recursive: true });
      await page.screenshot({
        path: `work/hidden-content/${game.id}/game-landscape.png`,
      });
      await page.setViewportSize({ width: 820, height: 1180 });
      await page.screenshot({
        path: `work/hidden-content/${game.id}/game-portrait.png`,
        fullPage: true,
      });
      await page.setViewportSize({ width: 1180, height: 820 });
    }
    for (let i = 0; i < game.puzzle.targets.length; i++) {
      await choose(page, game.puzzle.targets[i].area);
      await expect(page.locator(".answer-ring")).toHaveCount(i + 1);
    }
    await expect(
      page.getByRole("heading", { name: "모두 찾았어요!" }),
    ).toBeVisible();
    await context.close();
  }
});

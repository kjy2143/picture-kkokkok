import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const puzzle = JSON.parse(
  readFileSync("content/games/animals-easy-picnic/puzzle.json", "utf8"),
);

test("완료 그림을 다시 보고 정답을 유지하며 재시작을 취소할 수 있다", async ({
  page,
  browserName,
}) => {
  await page.goto("/?game=animals-easy-picnic");
  const help = page.getByRole("button", { name: "놀이 안내 닫기" });
  await expect(help).toBeVisible();
  await help.click();
  const board = await page.locator("svg.board").first().boundingBox();
  for (const difference of puzzle.differences) {
    await page.mouse.click(
      board!.x + board!.width * difference.left.x,
      board!.y + board!.height * difference.left.y,
    );
  }
  const complete = page.getByRole("dialog", { name: "모두 찾았어요!" });
  await expect(complete).toBeVisible();
  if (browserName === "chromium")
    await page.screenshot({
      path: ".impeccable/review/20261029-improved-completion.png",
    });
  await complete.getByRole("button", { name: "그림 더 보기" }).click();
  await expect(complete).toHaveCount(0);
  await expect(page.locator(".answer-ring")).toHaveCount(14);
  await expect(page.locator(".progress-count")).toHaveText("7 / 7개");
  await page.getByRole("button", { name: "다시 풀기", exact: true }).click();
  await page.getByRole("button", { name: "계속 풀기" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".answer-ring")).toHaveCount(14);
  if (browserName === "chromium")
    await page.screenshot({
      path: ".impeccable/review/20261029-improved-completed-board.png",
    });
  await page.reload();
  await expect(complete).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(complete).toHaveCount(0);
  await page.getByRole("button", { name: "다시 풀기", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "다시 풀기", exact: true })
    .click();
  await expect(page.locator(".answer-ring")).toHaveCount(0);
  await expect(page.locator(".progress-count")).toHaveText("0 / 7개");
});

test("설정 안에서 성공·실패·대기 상태를 확인하고 다시 시도한다", async ({
  page,
  browserName,
}) => {
  await page.addInitScript(() => {
    const storePut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value, key) {
      if (
        this.name === "settings" &&
        key === "sound" &&
        (window as any).failSound
      )
        throw new DOMException("test failure", "QuotaExceededError");
      return storePut.call(this, value, key!);
    };
    const cacheDelete = CacheStorage.prototype.delete;
    CacheStorage.prototype.delete = async function (name) {
      await new Promise<void>((resolve) => {
        (window as any).finishDeletion = resolve;
      });
      if ((window as any).failDeletion)
        throw new Error("test deletion failure");
      return cacheDelete.call(this, name);
    };
  });
  await page.goto("/?mode=differences");
  await page.getByRole("button", { name: "설정", exact: true }).click();
  const settings = page.getByRole("dialog", { name: "설정", exact: true });
  const sound = settings.getByRole("button", { name: /효과음/ });
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await sound.click();
  await expect(settings.getByRole("status")).toContainText("효과음을 껐어요.");
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await page.evaluate(() => {
    (window as any).failSound = true;
  });
  await sound.click();
  await expect(settings.locator("#sound-feedback")).toContainText(
    "저장하지 못했어요",
  );
  await page.evaluate(() => {
    (window as any).failSound = false;
  });
  await sound.click();
  await expect(settings.locator("#sound-feedback")).toHaveText(
    "효과음을 껐어요.",
  );
  await page.evaluate(() => {
    (window as any).failDeletion = true;
  });
  await settings
    .getByRole("button", { name: "게임 파일 삭제", exact: true })
    .click();
  await expect(
    settings.getByRole("button", { name: "삭제 중…" }),
  ).toBeDisabled();
  await expect(
    settings.getByRole("button", { name: "닫기", exact: true }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(settings).toBeVisible();
  await page.evaluate(() => {
    (window as any).finishDeletion();
  });
  await expect(
    settings.getByText("파일을 삭제하지 못했어요. 다시 시도해주세요.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.evaluate(() => {
    (window as any).failDeletion = false;
  });
  await settings
    .getByRole("button", { name: "게임 파일 삭제", exact: true })
    .click();
  await page.evaluate(() => {
    (window as any).finishDeletion();
  });
  await expect(
    settings.getByText(/오프라인 게임 파일을 삭제했어요/),
  ).toBeVisible();
  await settings
    .getByRole("button", { name: "진행 기록 초기화", exact: true })
    .click();
  await settings
    .getByRole("button", { name: "기록 초기화", exact: true })
    .click();
  await expect(settings.getByText(/진행 기록을 초기화했어요/)).toBeVisible();
  await expect(
    settings.getByRole("button", { name: "진행 기록 초기화", exact: true }),
  ).toBeFocused();
  if (browserName === "chromium")
    await page.screenshot({
      path: ".impeccable/review/20261029-improved-settings.png",
    });
});

test("키보드로 그림의 위치를 선택하고 양쪽 확대와 중복 정답을 유지한다", async ({
  page,
  browserName,
}) => {
  await page.goto("/?game=animals-easy-picnic");
  await page.getByRole("button", { name: "놀이 안내 닫기" }).click();
  const board = page.locator("svg.board").first();
  await board.focus();
  const target = puzzle.differences[0].left;
  await page.keyboard.down("Shift");
  for (const [value, positive, negative] of [
    [target.x, "ArrowRight", "ArrowLeft"],
    [target.y, "ArrowDown", "ArrowUp"],
  ] as const) {
    const steps = Math.round((value - 0.5) / 0.005);
    for (let i = 0; i < Math.abs(steps); i++)
      await page.keyboard.press(steps > 0 ? positive : negative);
  }
  await page.keyboard.up("Shift");
  await page.keyboard.press("Enter");
  await expect(page.locator(".answer-ring")).toHaveCount(2);
  await page.keyboard.press("Space");
  await expect(page.locator(".answer-ring")).toHaveCount(2);
  await page.keyboard.press("+");
  const transforms = await page
    .locator("svg.board > g")
    .evaluateAll((elements) =>
      elements.map((e) => e.getAttribute("transform")),
    );
  expect(transforms[0]).toBe(transforms[1]);
  expect(transforms[0]).toContain("scale(1.5)");
  await page.keyboard.press("-");
  await expect(board.locator(":scope > g")).toHaveAttribute(
    "transform",
    /scale\(1\)/,
  );
  await page.keyboard.press("Tab");
  await expect(page.locator("svg.board").nth(1)).toBeFocused();
  if (browserName === "chromium")
    await page.screenshot({
      path: ".impeccable/review/20261029-improved-keyboard.png",
    });
  await page.reload();
  await expect(page.locator(".answer-ring")).toHaveCount(2);
  await expect(
    page.getByRole("button", { name: "놀이 안내 닫기" }),
  ).toHaveCount(0);
});

test("홈은 전체 그림·44px 터치 영역을 보이고 도움말은 비교 그림을 덮지 않는다", async ({
  page,
  browserName,
}) => {
  for (const viewport of [
    { width: 1180, height: 820 },
    { width: 1100, height: 820 },
    { width: 1099, height: 820 },
    { width: 1024, height: 768 },
    { width: 960, height: 768 },
    { width: 959, height: 768 },
    { width: 1024, height: 1366 },
    { width: 820, height: 1180 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/?mode=differences");
    await expect(page.locator(".game-card").first()).toBeVisible();
    const layout = await page.evaluate(() => {
      const first = document
        .querySelector(".game-card")!
        .getBoundingClientRect();
      return {
        firstBottom: first.bottom,
        firstTop: first.top,
        columns: getComputedStyle(
          document.querySelector(".game-grid")!,
        ).gridTemplateColumns.split(" ").length,
        thumbnailRatio: (() => {
          const r = document
            .querySelector(".thumbnail")!
            .getBoundingClientRect();
          return r.width / r.height;
        })(),
        objectFit: getComputedStyle(document.querySelector(".thumbnail img")!)
          .objectFit,
        smallButtons: [...document.querySelectorAll("button")]
          .filter((button) => {
            const r = button.getBoundingClientRect();
            return r.width < 44 || r.height < 44;
          })
          .map((b) => b.textContent),
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(layout.objectFit).toBe("contain");
    const fourColumns =
      viewport.width >= 1100 ||
      (viewport.width >= 960 && viewport.width > viewport.height);
    expect(layout.columns).toBe(
      fourColumns ? 4 : viewport.width > 900 ? 3 : viewport.width > 540 ? 2 : 1,
    );
    expect(layout.thumbnailRatio).toBeCloseTo(fourColumns ? 4 / 5 : 3 / 2, 3);
    expect(layout.smallButtons).toEqual([]);
    expect(layout.overflow).toBe(false);
    if (viewport.width !== 820)
      expect(layout.firstBottom).toBeLessThanOrEqual(viewport.height);
    if (browserName === "chromium")
      await page.screenshot({
        path: `.impeccable/review/20261029-ipad-grid-${viewport.width}x${viewport.height}.png`,
      });
    await page.getByRole("button", { name: /숲속 친구들의 소풍/ }).click();
    await expect(page.locator("svg.board")).toHaveCount(2);
    const help = page.getByRole("button", { name: "놀이 도움말" });
    if ((await help.getAttribute("aria-expanded")) !== "true")
      await help.click();
    const regions = await page.evaluate(() => ({
      helpBottom: document.querySelector(".play-help")!.getBoundingClientRect()
        .bottom,
      boardTop: document.querySelector("svg.board")!.getBoundingClientRect()
        .top,
      overflow:
        document.documentElement.scrollHeight > innerHeight ||
        document.documentElement.scrollWidth > innerWidth,
    }));
    expect(regions.helpBottom).toBeLessThanOrEqual(regions.boardTop);
    expect(regions.overflow).toBe(false);
    if (browserName === "chromium")
      await page.screenshot({
        path: `.impeccable/review/20261029-improved-help-${viewport.width}.png`,
      });
    await page.getByRole("button", { name: "놀이 안내 닫기" }).click();
    await page.reload();
    await expect(help).toHaveAttribute("aria-expanded", "false");
    if (browserName === "chromium" && viewport.width === 1180)
      await page.screenshot({
        path: ".impeccable/review/20261029-improved-game.png",
      });
  }
});

import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const picnicPuzzle = JSON.parse(
  readFileSync("content/games/animals-easy-picnic/puzzle.json", "utf8"),
);
const picnicFirst = picnicPuzzle.differences[0].left;
const kitchenPuzzle = JSON.parse(
  readFileSync("content/games/daily-easy-kitchen/puzzle.json", "utf8"),
);
const kitchenFirst = kitchenPuzzle.differences[0].left;
test("소리는 기본으로 켜지고 오답·정답 효과음과 저장된 음소거가 구분된다", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const log = window as unknown as { playedNotes: number[] };
    log.playedNotes = [];
    const create = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function () {
      const oscillator = create.call(this);
      const start = oscillator.start.bind(oscillator);
      oscillator.start = (time) => {
        log.playedNotes.push(oscillator.frequency.value);
        start(time);
      };
      return oscillator;
    };
  });
  await page.goto("/?mode=differences");
  await expect(
    page.getByRole("button", { name: "소리 끄기", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /숲속 친구들의 소풍/ }),
  ).toBeVisible();
  await expect(page.locator(".draft-banner")).toHaveCount(0);
  await page.getByRole("button", { name: /숲속 친구들의 소풍/ }).click();
  const first = await page.locator("svg.board").first().boundingBox();
  await page.mouse.click(
    first!.x + first!.width * 0.98,
    first!.y + first!.height * 0.98,
  );
  await expect(page.locator(".wrong-ring")).toHaveCount(1);
  await expect(page.locator(".answer-ring")).toHaveCount(0);
  const wrong = await page.evaluate(() =>
    (window as unknown as { playedNotes: number[] }).playedNotes.slice(),
  );
  expect(wrong.length).toBeGreaterThan(0);
  await page.mouse.click(
    first!.x + first!.width * picnicFirst.x,
    first!.y + first!.height * picnicFirst.y,
  );
  await expect(page.locator(".answer-ring")).toHaveCount(2);
  const all = await page.evaluate(() =>
    (window as unknown as { playedNotes: number[] }).playedNotes.slice(),
  );
  expect(all.length).toBeGreaterThan(wrong.length);
  expect(all.slice(wrong.length)).not.toEqual(wrong);
  await page.getByRole("button", { name: "소리 끄기", exact: true }).click();
  await page.getByRole("button", { name: "다른 게임", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "소리 켜기", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /숲속 친구들의 소풍/ }).click();
  const next = await page.locator("svg.board").first().boundingBox();
  await page.mouse.click(
    next!.x + next!.width * 0.98,
    next!.y + next!.height * 0.98,
  );
  expect(
    await page.evaluate(
      () => (window as unknown as { playedNotes: number[] }).playedNotes,
    ),
  ).toEqual([]);
});
test("게임 중 다시 풀기는 취소할 수 있고 해당 게임의 정답·힌트를 지워 저장한다", async ({
  page,
}) => {
  await page.goto("/?mode=differences");
  await page.getByRole("button", { name: /숲속 친구들의 소풍/ }).click();
  const old = await page.locator("svg.board").first().boundingBox();
  await page.mouse.click(
    old!.x + old!.width * picnicFirst.x,
    old!.y + old!.height * picnicFirst.y,
  );
  await expect(page.locator(".answer-ring")).toHaveCount(2);
  await page.getByRole("button", { name: "다른 게임", exact: true }).click();
  await page.getByRole("button", { name: /함께 만드는 아침/ }).click();
  const board = await page.locator("svg.board").first().boundingBox();
  await page.mouse.click(
    board!.x + board!.width * kitchenFirst.x,
    board!.y + board!.height * kitchenFirst.y,
  );
  await expect(page.locator(".progress-count")).toHaveText("1 / 7개");
  const restart = page.getByRole("button", { name: "다시 풀기", exact: true });
  const dialog = page.getByRole("dialog", { name: "처음부터 다시 풀까요?" });
  await restart.click();
  await expect(dialog.getByRole("button", { name: "계속 풀기" })).toBeFocused();
  await dialog.getByRole("button", { name: "계속 풀기" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".progress-count")).toHaveText("1 / 7개");
  await expect(restart).toBeFocused();
  await restart.click();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".answer-ring")).toHaveCount(2);
  await page.getByRole("button", { name: "힌트", exact: true }).click();
  await expect(page.locator(".hint-ring")).toHaveCount(2);
  await restart.click();
  await dialog.getByRole("button", { name: "다시 풀기", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".answer-ring")).toHaveCount(0);
  await expect(page.locator(".hint-ring")).toHaveCount(0);
  await expect(page.locator(".progress-count")).toHaveText("0 / 7개");
  await page.getByRole("button", { name: "다른 게임", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: /함께 만드는 아침/ }).click();
  await expect(page.locator(".answer-ring")).toHaveCount(0);
  await page.getByRole("button", { name: "다른 게임", exact: true }).click();
  await page.getByRole("button", { name: /숲속 친구들의 소풍/ }).click();
  await expect(page.locator(".answer-ring")).toHaveCount(2);
});
test("양쪽 정답·이어 풀기·완료·기록 초기화", async ({ page }) => {
  await page.goto("/?mode=differences");
  await page.getByRole("button", { name: /숲속 친구들의 소풍/ }).click();
  const boards = page.locator("svg.board");
  await expect(boards).toHaveCount(2);
  const first = boards.nth(0),
    second = boards.nth(1),
    a = await first.boundingBox(),
    b = await second.boundingBox();
  await page.mouse.click(
    a!.x + a!.width * picnicFirst.x,
    a!.y + a!.height * picnicFirst.y,
  );
  await expect(page.locator(".answer-ring")).toHaveCount(2);
  await page.mouse.click(
    b!.x + b!.width * picnicFirst.x,
    b!.y + b!.height * picnicFirst.y,
  );
  await expect(page.locator(".answer-ring")).toHaveCount(2);
  await page.reload();
  await expect(page.locator(".answer-ring")).toHaveCount(2);
  await page.getByRole("button", { name: "힌트", exact: true }).click();
  await expect(page.locator(".hint-ring")).toHaveCount(2);
  await expect(page.locator(".answer-ring")).toHaveCount(2);
  const box = await page.locator("svg.board").nth(1).boundingBox();
  for (const difference of picnicPuzzle.differences.slice(1)) {
    const { x, y } = difference.right;
    await page.mouse.click(box!.x + box!.width * x, box!.y + box!.height * y);
  }
  await expect(
    page.getByRole("heading", { name: "모두 찾았어요!" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "다른 게임 고르기" }).click();
  await expect(page.locator(".completed-stamp")).toBeVisible();
  await page.getByRole("button", { name: "설정", exact: true }).click();
  await page
    .getByRole("button", { name: "진행 기록 초기화", exact: true })
    .click();
  await expect(page.locator(".completed-stamp")).toHaveCount(1);
  await page.getByRole("button", { name: "기록 초기화", exact: true }).click();
  await page.getByRole("button", { name: "닫기", exact: true }).last().click();
  await expect(page.locator(".completed-stamp")).toHaveCount(0);
});
test("열어본 게임은 오프라인에서 실행하고 파일 삭제는 진행 기록을 유지한다", async ({
  page,
  context,
}) => {
  await page.goto("/?mode=differences");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.getByRole("button", { name: /숲속 친구들의 소풍/ }).click();
  await page.getByRole("button", { name: "다른 게임", exact: true }).click();
  await expect(page.getByText("오프라인 가능", { exact: true })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect
    .poll(() =>
      page
        .getByRole("button", { name: /숲속 친구들의 소풍/ })
        .locator(".thumbnail img")
        .evaluateAll((es) =>
          es.every(
            (e) =>
              (e as HTMLImageElement).complete &&
              (e as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  await page.getByRole("button", { name: /숲속 친구들의 소풍/ }).click();
  await expect(page.locator("svg.board")).toHaveCount(2);
  const box = await page.locator("svg.board").first().boundingBox();
  await page.mouse.click(
    box!.x + box!.width * picnicFirst.x,
    box!.y + box!.height * picnicFirst.y,
  );
  await expect(page.locator(".answer-ring")).toHaveCount(2);
  await page.getByRole("button", { name: "다른 게임", exact: true }).click();
  await page.getByRole("button", { name: "설정", exact: true }).click();
  await page
    .getByRole("button", { name: "게임 파일 삭제", exact: true })
    .click();
  await page.getByRole("button", { name: "닫기", exact: true }).last().click();
  await expect(page.getByText("푸는 중 · 1/7")).toBeVisible();
  await expect(page.getByText("오프라인 가능", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: /숲속 친구들의 소풍/ }).click();
  await expect(page.getByRole("status")).toContainText("인터넷 연결이 필요");
});
test("가로·세로 배치와 필터", async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 820 });
  await page.goto("/?mode=differences");
  await page.getByRole("button", { name: "우주", exact: true }).click();
  const catalog = await (await page.request.get("/catalog.json")).json();
  const spaceGames = catalog.games.filter(
    (g: { theme: string; kind?: string }) =>
      g.theme === "우주" && g.kind !== "hidden",
  );
  expect(spaceGames.length).toBeGreaterThanOrEqual(3);
  await expect(page.locator(".game-card")).toHaveCount(spaceGames.length);
  await expect(page.locator(".card-meta")).toContainText(
    spaceGames.map(() => "우주"),
  );
  await page.getByRole("button", { name: "전체", exact: true }).click();
  await page.getByRole("button", { name: /숲속 친구들의 소풍/ }).click();
  await expect(page.locator(".board-frame")).toHaveCount(2);
  let boxes = await page.locator(".board-frame").evaluateAll((elements) =>
    elements.map((e) => {
      const r = e.getBoundingClientRect();
      return { x: r.x, y: r.y };
    }),
  );
  expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThan(2);
  await page.setViewportSize({ width: 820, height: 1180 });
  boxes = await page.locator(".board-frame").evaluateAll((elements) =>
    elements.map((e) => {
      const r = e.getBoundingClientRect();
      return { x: r.x, y: r.y };
    }),
  );
  expect(boxes[1].y).toBeGreaterThan(boxes[0].y);
  expect(Math.abs(boxes[0].x - boxes[1].x)).toBeLessThan(2);
});
test("세로 원본은 비율과 좌표를 유지하고 가로 상단은 한 줄에 들어간다", async ({
  page,
}) => {
  await page.goto("/?game=animals-easy-picnic");
  await expect(page.locator("svg.board")).toHaveCount(2);
  for (const viewport of [
    { width: 1180, height: 820 },
    { width: 1180, height: 720 },
    { width: 820, height: 1180 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    const layout = await page.evaluate(() => {
      const boards = [...document.querySelectorAll("svg.board")].map((e) =>
        e.getBoundingClientRect(),
      );
      const r = boards[0];
      const header = document
        .querySelector(".play-heading")!
        .getBoundingClientRect();
      return {
        width: r.width,
        height: r.height,
        headerHeight: header.height,
        boardGap: boards[1].left - boards[0].right,
        pageHeight: document.documentElement.scrollHeight,
        viewportHeight: innerHeight,
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
      };
    });
    expect(layout.width / layout.height).toBeCloseTo(4 / 5, 3);
    expect(layout.pageHeight).toBeLessThanOrEqual(layout.viewportHeight);
    expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewportWidth);
    if (viewport.width > viewport.height) {
      expect(layout.headerHeight).toBe(64);
      expect(layout.boardGap).toBeCloseTo(16, 2);
    }
  }
  await page.setViewportSize({ width: 1180, height: 720 });
  // An answer away from the image centre catches letterboxing coordinate errors.
  const first = await page.locator("svg.board").first().boundingBox();
  await page.mouse.click(
    first!.x + first!.width * picnicFirst.x,
    first!.y + first!.height * picnicFirst.y,
  );
  await expect(page.locator(".answer-ring")).toHaveCount(2);
  await expect(page.locator(".progress-count")).toHaveText("1 / 7개");
  const second = await page.locator("svg.board").nth(1).boundingBox();
  await page.mouse.click(
    second!.x + second!.width * picnicPuzzle.differences[1].right.x,
    second!.y + second!.height * picnicPuzzle.differences[1].right.y,
  );
  await expect(page.locator(".answer-ring")).toHaveCount(4);
  await page.getByRole("button", { name: "힌트", exact: true }).click();
  await expect(page.locator(".hint-ring")).toHaveCount(2);
});
test("업데이트는 게임 중 대기하고 홈에서 버튼으로 적용하며 진행 기록을 유지한다", async ({
  page,
}) => {
  const fs = await import("node:fs/promises"),
    original = await fs.readFile("dist/sw.js", "utf8");
  try {
    await page.goto("/?mode=differences");
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await page.getByRole("button", { name: /숲속 친구들의 소풍/ }).click();
    await expect(page.locator("svg.board")).toHaveCount(2);
    const box = await page.locator("svg.board").first().boundingBox();
    await page.mouse.click(
      box!.x + box!.width * picnicFirst.x,
      box!.y + box!.height * picnicFirst.y,
    );
    await expect(page.locator(".answer-ring")).toHaveCount(2);
    await fs.writeFile(
      "dist/sw.js",
      original + "\n// local update test " + Date.now(),
    );
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration!.update();
    });
    await expect
      .poll(() =>
        page.evaluate(
          async () =>
            !!(await navigator.serviceWorker.getRegistration())?.waiting,
        ),
      )
      .toBe(true);
    await expect(
      page.getByRole("button", { name: "업데이트", exact: true }),
    ).toHaveCount(0);
    await expect(page.locator(".answer-ring")).toHaveCount(2);
    await page.getByRole("button", { name: "다른 게임", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "업데이트", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "업데이트", exact: true }).click();
    await expect(page.getByText("푸는 중 · 1/7")).toBeVisible();
    await page.getByRole("button", { name: /숲속 친구들의 소풍/ }).click();
    await expect(page.locator(".answer-ring")).toHaveCount(2);
  } finally {
    await fs.writeFile("dist/sw.js", original);
  }
});
test("두 손가락 확대는 두 그림에 같은 변환을 적용하고 정답으로 처리하지 않는다", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "CDP touch injection is only available in Chromium. Actual iPad touch remains a manual gate.",
  );
  await page.goto("/?mode=differences");
  await page.getByRole("button", { name: /숲속 친구들의 소풍/ }).click();
  await expect(page.locator("svg.board")).toHaveCount(2);
  const box = await page.locator("svg.board").first().boundingBox(),
    x = box!.x + box!.width * 0.65,
    y = box!.y + box!.height * 0.55;
  const session = await page.context().newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: x - 30, y, id: 1 },
      { x: x + 30, y, id: 2 },
    ],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: x - 70, y, id: 1 },
      { x: x + 70, y, id: 2 },
    ],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(() => page.locator("svg.board g").first().getAttribute("transform"))
    .not.toContain("scale(1)");
  const transforms = await page
    .locator("svg.board g")
    .evaluateAll((es) => es.map((e) => e.getAttribute("transform")));
  expect(transforms[0]).toBe(transforms[1]);
  const anchor = await page
    .locator("svg.board g")
    .first()
    .evaluate((element) => {
      const m = (element as SVGGraphicsElement).transform.baseVal.consolidate()!
        .matrix;
      return {
        x:
          (m.a * element.ownerSVGElement!.viewBox.baseVal.width * 0.65 + m.e) /
          element.ownerSVGElement!.viewBox.baseVal.width,
        y:
          (m.d * element.ownerSVGElement!.viewBox.baseVal.height * 0.55 + m.f) /
          element.ownerSVGElement!.viewBox.baseVal.height,
      };
    });
  expect(anchor.x).toBeCloseTo(0.65, 2);
  expect(anchor.y).toBeCloseTo(0.55, 2);
  await expect(page.locator(".answer-ring")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "확대 초기화", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "다시 풀기", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("svg.board g").first()).toHaveAttribute(
    "transform",
    /scale\(1\)/,
  );
});

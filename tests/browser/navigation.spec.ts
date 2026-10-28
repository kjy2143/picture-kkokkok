import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

// Network fault and delay injection must reach page.route, not a service worker.
test.use({ serviceWorkers: "block" });

const picnic = JSON.parse(
  readFileSync("content/games/animals-easy-picnic/puzzle.json", "utf8"),
);

test("게임 주소·뒤로가기·앞으로가기·새로고침이 진행 기록과 함께 동작한다", async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 1180, height: 820 });
  await page.goto("/?source=test&mode=differences#games");
  await expect(
    page.getByRole("button", { name: /숲속 친구들의 소풍/ }),
  ).toBeVisible();
  const length = await page.evaluate(() => history.length);
  await page.getByRole("button", { name: /숲속 친구들의 소풍/ }).click();
  await expect(page).toHaveURL(
    /\?source=test&mode=differences&game=animals-easy-picnic#games$/,
  );
  await expect(page.locator("svg.board")).toHaveCount(2);
  if (browserName === "chromium")
    await page.screenshot({
      path: ".impeccable/review/navigation-toolbar.png",
    });
  expect(await page.evaluate(() => history.length)).toBe(length + 1);
  await expect(
    page.getByRole("button", { name: "확대 초기화", exact: true }),
  ).toHaveCount(0);
  const box = await page.locator("svg.board").first().boundingBox();
  const point = picnic.differences[0].left;
  await page.mouse.click(
    box!.x + box!.width * point.x,
    box!.y + box!.height * point.y,
  );
  await expect(page.locator(".answer-ring")).toHaveCount(2);
  await page.goBack();
  await expect(page).toHaveURL(/\?source=test&mode=differences#games$/);
  await expect(
    page.getByRole("button", { name: /숲속 친구들의 소풍/ }),
  ).toBeVisible();
  await page.goForward();
  await expect(page.locator(".answer-ring")).toHaveCount(2);
  await expect(page).toHaveURL(/game=animals-easy-picnic/);
  await page.reload();
  await expect(page.locator(".answer-ring")).toHaveCount(2);
  await page.getByRole("button", { name: "다른 게임", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /숲속 친구들의 소풍/ }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\?source=test&mode=differences#games$/);
  // The in-app back action must preserve the existing forward entry.
  expect(await page.evaluate(() => history.length)).toBe(length + 1);
  await page.goForward();
  await expect(page.locator(".answer-ring")).toHaveCount(2);
});

test("직접 게임 주소로 진입해도 목록으로 안전하게 돌아온다", async ({
  page,
}) => {
  await page.goto("/?source=link&game=daily-easy-kitchen#games");
  await expect(
    page.getByRole("heading", { name: "함께 만드는 아침" }),
  ).toBeVisible();
  const length = await page.evaluate(() => history.length);
  await page.getByRole("button", { name: "다른 게임", exact: true }).click();
  await expect(page).toHaveURL(/\?source=link&mode=differences#games$/);
  await expect(
    page.getByRole("button", { name: /숲속 친구들의 소풍/ }),
  ).toBeVisible();
  expect(await page.evaluate(() => history.length)).toBe(length);
});

test("뒤로간 뒤 이전 게임 로딩이 늦게 끝나도 새 게임을 덮지 않는다", async ({
  page,
}) => {
  let release!: () => void;
  let intercepted = 0;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/animals-easy-picnic/**/puzzle.json", async (route) => {
    ++intercepted;
    await gate;
    await route.continue();
  });
  await page.goto("/?mode=differences");
  await page.getByRole("button", { name: /숲속 친구들의 소풍/ }).click();
  await expect(page).toHaveURL(/game=animals-easy-picnic/);
  await expect.poll(() => intercepted).toBe(1);
  await page.goBack();
  await expect(
    page.getByRole("button", { name: /숲속 친구들의 소풍/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /함께 만드는 아침/ }).click();
  await expect(
    page.getByRole("heading", { name: "함께 만드는 아침" }),
  ).toBeVisible();
  release();
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/game=daily-easy-kitchen/);
  await expect(
    page.getByRole("heading", { name: "함께 만드는 아침" }),
  ).toBeVisible();
  await expect(page.locator("svg.board")).toHaveCount(2);
});

test("잘못된 게임 주소는 목록으로 정리하고 실패한 게임은 재시도할 수 있다", async ({
  page,
}) => {
  await page.goto("/?game=missing&source=test");
  await expect(page).toHaveURL(/\?source=test&mode=differences$/);
  await expect(
    page.getByText("찾는 게임이 없어요. 다른 게임을 골라주세요."),
  ).toBeVisible();
  const pattern = "**/animals-easy-picnic/**/puzzle.json";
  await page.route(pattern, (route) =>
    route.fulfill({ status: 503, body: "unavailable" }),
  );
  await page.getByRole("button", { name: /숲속 친구들의 소풍/ }).click();
  await expect(page.getByRole("status")).toContainText(
    "게임을 불러오지 못했어요",
  );
  const length = await page.evaluate(() => history.length);
  await page.unroute(pattern);
  await page.getByRole("button", { name: /숲속 친구들의 소풍/ }).click();
  await expect(page.locator("svg.board")).toHaveCount(2);
  expect(await page.evaluate(() => history.length)).toBe(length);
});

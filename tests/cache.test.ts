import { afterEach, describe, expect, it, vi } from "vitest";
import { cacheGame, gameAssetUrls, isOfflineReady } from "../src/cache";
import type { Game } from "../src/types";
const game: Game = {
  kind: "hidden",
  id: "hidden-test",
  title: "테스트",
  theme: "동물",
  difficulty: "easy",
  original: "/games/test/scene.webp",
  thumbnail: "/games/test/thumb.webp",
  puzzleUrl: "/games/test/puzzle.json",
  targetImages: Array.from(
    { length: 7 },
    (_, i) => `/games/test/target-${i}.webp`,
  ),
  gameplayRevision: "a",
  contentRevision: "a",
};
afterEach(() => vi.unstubAllGlobals());
describe("오프라인 필수 목표 파일", () => {
  it("목표 한 개라도 없으면 준비 완료로 표시하지 않는다", async () => {
    const cached = new Map(
      gameAssetUrls(game)
        .slice(0, -1)
        .map((url) => [url, new Response("ok")]),
    );
    vi.stubGlobal("caches", {
      open: async () => ({ match: async (url: string) => cached.get(url) }),
    });
    expect(await isOfflineReady(game)).toBe(false);
    cached.set(game.targetImages![6], new Response("ok"));
    expect(await isOfflineReady(game)).toBe(true);
  });
  it("파일 다운로드 실패는 불완전한 묶음을 공개하지 않는다", async () => {
    const put = vi.fn();
    vi.stubGlobal("caches", { open: async () => ({ put }) });
    vi.stubGlobal(
      "fetch",
      async (url: string) =>
        new Response("body", {
          status: url === game.targetImages![3] ? 404 : 200,
        }),
    );
    await expect(cacheGame(game)).rejects.toThrow("모두 저장");
    expect(put).not.toHaveBeenCalled();
  });
  it("JSON의 실제 목표 목록과 카탈로그가 다르면 저장하지 않는다", async () => {
    const put = vi.fn();
    vi.stubGlobal("caches", { open: async () => ({ put }) });
    vi.stubGlobal(
      "fetch",
      async (url: string) =>
        new Response(
          url === game.puzzleUrl
            ? JSON.stringify({
                id: game.id,
                kind: "hidden",
                targets: [{ image: "unexpected.webp" }],
              })
            : "body",
        ),
    );
    await expect(cacheGame(game)).rejects.toThrow("물건 파일");
    expect(put).not.toHaveBeenCalled();
  });
});

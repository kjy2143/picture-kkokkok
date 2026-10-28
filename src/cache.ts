import { countByLevel } from "./game";
import type { Game } from "./types";
export const GAME_CACHE = "kkokkok-games-v1";
export const gameAssetUrls = (g: Game): string[] => [
  ...new Set(
    [
      g.original,
      g.modified,
      g.puzzleUrl,
      g.thumbnail,
      ...(g.targetImages || []),
    ].filter((u): u is string => !!u),
  ),
];
export async function isOfflineReady(g: Game) {
  if (
    g.kind === "hidden" &&
    g.targetImages?.length !== countByLevel[g.difficulty]
  )
    return false;
  try {
    const cache = await caches.open(GAME_CACHE);
    return (
      await Promise.all(gameAssetUrls(g).map((u) => cache.match(u)))
    ).every(Boolean);
  } catch {
    return false;
  }
}
export async function cacheGame(g: Game) {
  const urls = gameAssetUrls(g),
    cache = await caches.open(GAME_CACHE);
  const responses = await Promise.all(urls.map((u) => fetch(u)));
  if (responses.some((r) => !r.ok))
    throw new Error("게임 파일을 모두 저장하지 못했어요.");
  const bodies = await Promise.all(responses.map((r) => r.arrayBuffer()));
  const puzzle = JSON.parse(
    new TextDecoder().decode(bodies[urls.indexOf(g.puzzleUrl)]),
  );
  const hidden = g.kind === "hidden";
  if (
    puzzle.id !== g.id ||
    (hidden
      ? puzzle.kind !== "hidden" || !Array.isArray(puzzle.targets)
      : !Array.isArray(puzzle.differences))
  )
    throw new Error("게임 데이터가 맞지 않아요.");
  if (hidden) {
    const base = g.puzzleUrl.slice(0, g.puzzleUrl.lastIndexOf("/") + 1);
    const required = puzzle.targets.map(
      (target: { image: string }) => base + target.image,
    );
    if (
      required.length !== (g.targetImages || []).length ||
      required.some((url: string) => !g.targetImages?.includes(url))
    )
      throw new Error("찾을 물건 파일이 맞지 않아요.");
  }
  // Read every body before exposing any new bundle as offline-ready.
  for (let i = 0; i < responses.length; i++)
    await cache.put(
      urls[i],
      new Response(bodies[i], { headers: responses[i].headers }),
    );
  if (!(await isOfflineReady(g)))
    throw new Error("오프라인 저장을 확인하지 못했어요.");
}
export async function deleteOfflineFiles() {
  if ("caches" in globalThis) await caches.delete(GAME_CACHE);
}

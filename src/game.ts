import type {
  Area,
  Difference,
  Progress,
  Game,
  Puzzle,
  HiddenTarget,
} from "./types";
export function contains(area: Area, x: number, y: number) {
  return ((x - area.x) / area.rx) ** 2 + ((y - area.y) / area.ry) ** 2 <= 1;
}
export function hit(
  differences: Difference[],
  side: "left" | "right",
  x: number,
  y: number,
) {
  return differences.find((d) => contains(d[side], x, y));
}
export function currentProgress(game: Game, stored?: Progress): Progress {
  return stored?.revision === game.gameplayRevision
    ? stored
    : {
        id: game.id,
        revision: game.gameplayRevision,
        found: [],
        completed: false,
        updatedAt: new Date().toISOString(),
      };
}
export const levelNames = { easy: "쉬움", medium: "보통", hard: "어려움" };
export const countByLevel = { easy: 7, medium: 8, hard: 10 };

export const gameKind = (game: Game) => game.kind || "differences";
export function puzzleAnswers(puzzle: Puzzle): Difference[] {
  return puzzle.kind === "hidden"
    ? puzzle.targets.map((target) => ({
        id: target.id,
        description: target.label,
        left: target.area,
        right: target.area,
      }))
    : puzzle.differences;
}
export function targetImageUrl(game: Game, target: HiddenTarget): string {
  return (
    game.puzzleUrl.slice(0, game.puzzleUrl.lastIndexOf("/") + 1) + target.image
  );
}

// A small hidden silhouette still needs a usable finger target at any zoom.
export function hitWithTolerance(
  differences: Difference[],
  side: "left" | "right",
  x: number,
  y: number,
  minimumRadius: { rx: number; ry: number },
) {
  const exact = hit(differences, side, x, y);
  if (exact) return exact;
  return differences
    .map((d) => {
      const a = d[side];
      const distance =
        ((x - a.x) / Math.max(a.rx, minimumRadius.rx)) ** 2 +
        ((y - a.y) / Math.max(a.ry, minimumRadius.ry)) ** 2;
      return { difference: d, distance };
    })
    .filter((candidate) => candidate.distance <= 1)
    .sort((a, b) => a.distance - b.distance)[0]?.difference;
}

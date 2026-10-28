export type Difficulty = "easy" | "medium" | "hard";
export type GameKind = "differences" | "hidden";
export interface Area {
  x: number;
  y: number;
  rx: number;
  ry: number;
}
export interface Difference {
  id: string;
  description: string;
  left: Area;
  right: Area;
}
interface PuzzleBase {
  schemaVersion: 1;
  id: string;
  width: number;
  height: number;
  original: string;
}
export interface DifferencePuzzle extends PuzzleBase {
  kind?: "differences";
  modified: string;
  differences: Difference[];
}
export interface HiddenTarget {
  id: string;
  label: string;
  image: string;
  area: Area;
}
export interface HiddenPuzzle extends PuzzleBase {
  kind: "hidden";
  targets: HiddenTarget[];
}
export type Puzzle = DifferencePuzzle | HiddenPuzzle;
export interface Game {
  id: string;
  kind?: GameKind;
  title: string;
  theme: string;
  difficulty: Difficulty;
  thumbnail: string;
  original: string;
  modified?: string;
  targetImages?: string[];
  puzzleUrl: string;
  gameplayRevision: string;
  contentRevision: string;
}
export interface Catalog {
  schemaVersion: 1;
  releaseId: string;
  games: Game[];
  hiddenGames?: Game[];
}
export interface Progress {
  id: string;
  revision: string;
  found: string[];
  completed: boolean;
  updatedAt: string;
}

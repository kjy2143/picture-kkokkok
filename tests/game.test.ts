import { describe, it, expect } from "vitest";
import { contains, hit, currentProgress } from "../src/game";
import type { Game, Difference } from "../src/types";
const area = { x: 0.5, y: 0.5, rx: 0.1, ry: 0.05 };
const d: Difference = {
  id: "a",
  description: "차이",
  left: area,
  right: { ...area, x: 0.7 },
};
const game = { id: "test", gameplayRevision: "a" } as Game;
describe("정답과 진행 버전", () => {
  it("타원의 내부와 외부를 구분한다", () => {
    expect(contains(area, 0.5, 0.5)).toBe(true);
    expect(contains(area, 0.59, 0.54)).toBe(false);
  });
  it("양쪽 그림의 서로 다른 위치를 같은 정답으로 처리한다", () => {
    expect(hit([d], "left", 0.5, 0.5)?.id).toBe("a");
    expect(hit([d], "right", 0.7, 0.5)?.id).toBe("a");
    expect(hit([d], "right", 0.5, 0.5)).toBeUndefined();
  });
  it("제목과 썸네일 변경은 같은 진행 버전을 유지한다", () => {
    const stored = {
      id: "test",
      revision: "a",
      found: ["a"],
      completed: true,
      updatedAt: "now",
    };
    expect(currentProgress({ ...game, title: "새 제목" }, stored)).toBe(stored);
  });
  it("그림 또는 정답 버전이 바뀐 게임만 초기화한다", () => {
    const p = currentProgress(
      { ...game, gameplayRevision: "b" },
      {
        id: "test",
        revision: "a",
        found: ["a"],
        completed: true,
        updatedAt: "now",
      },
    );
    expect(p.found).toEqual([]);
    expect(p.completed).toBe(false);
  });
});

import { gameKind, puzzleAnswers, targetImageUrl } from "../src/game";
import type { HiddenPuzzle } from "../src/types";
it("기존 종류를 유지하며 숨은그림 하나의 영역을 같은 입력 엔진에 연결한다", () => {
  const hidden: HiddenPuzzle = {
    schemaVersion: 1,
    kind: "hidden",
    id: "hidden",
    width: 400,
    height: 300,
    original: "scene.webp",
    targets: [{ id: "leaf", label: "나뭇잎", image: "target.webp", area }],
  };
  expect(gameKind(game)).toBe("differences");
  expect(hit(puzzleAnswers(hidden), "left", 0.5, 0.5)?.id).toBe("leaf");
  expect(
    targetImageUrl(
      { ...game, puzzleUrl: "/games/hidden/rev/puzzle.json" },
      hidden.targets[0],
    ),
  ).toBe("/games/hidden/rev/target.webp");
});

import { hitWithTolerance } from "../src/game";
it("작은 숨은 모양의 손가락 여유는 화면 크기를 따르고 가까운 정답을 고른다", () => {
  const narrow = { ...d, left: { x: 0.5, y: 0.5, rx: 0.005, ry: 0.02 } };
  expect(hit([narrow], "left", 0.52, 0.5)).toBeUndefined();
  expect(
    hitWithTolerance([narrow], "left", 0.52, 0.5, { rx: 0.025, ry: 0.025 })?.id,
  ).toBe("a");
  expect(
    hitWithTolerance([narrow], "left", 0.53, 0.5, { rx: 0.025, ry: 0.025 }),
  ).toBeUndefined();
  expect(
    hitWithTolerance([narrow], "left", 0.52, 0.5, { rx: 0.00625, ry: 0.00625 }),
  ).toBeUndefined();
  const nearby = { ...narrow, id: "b", left: { ...narrow.left, x: 0.55 } };
  expect(
    hitWithTolerance([narrow, nearby], "left", 0.537, 0.5, {
      rx: 0.04,
      ry: 0.04,
    })?.id,
  ).toBe("b");
});

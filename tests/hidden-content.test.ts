import { beforeAll, afterAll, describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";
let tmp: string, c: any, dir: string;
const read = async (name: string) =>
  JSON.parse(await fs.readFile(path.join(dir, name), "utf8"));
const write = async (name: string, value: unknown) =>
  fs.writeFile(path.join(dir, name), JSON.stringify(value));
beforeAll(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "kkokkok-hidden-"));
  process.env.CONTENT_ROOT = tmp;
  c = await import("../scripts/content.mjs");
  dir = path.join(tmp, "content/games/hidden-test");
  await fs.mkdir(dir, { recursive: true });
  await sharp({
    create: { width: 400, height: 300, channels: 3, background: "green" },
  })
    .webp()
    .toFile(path.join(dir, "scene.webp"));
  await sharp(path.join(dir, "scene.webp"))
    .resize({ width: 200 })
    .toFile(path.join(dir, "thumbnail.webp"));
  const targets = [];
  for (let i = 0; i < 7; i++) {
    const image = `target-${i}.png`;
    const square = await sharp({
      create: { width: 48, height: 48, channels: 4, background: "green" },
    })
      .png()
      .toBuffer();
    await sharp({
      create: {
        width: 96,
        height: 96,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: square, left: 24, top: 24 }])
      .png()
      .toFile(path.join(dir, image));
    targets.push({
      id: `t${i}`,
      label: `목표 ${i}`,
      image,
      area: { x: 0.1 + i * 0.12, y: 0.5, rx: 0.04, ry: 0.08 },
    });
  }
  await write("metadata.json", {
    schemaVersion: 1,
    kind: "hidden",
    id: "hidden-test",
    title: "숨은 모양",
    theme: "동물",
    difficulty: "easy",
    thumbnail: "thumbnail.webp",
  });
  await write("puzzle.json", {
    schemaVersion: 1,
    kind: "hidden",
    id: "hidden-test",
    width: 400,
    height: 300,
    original: "scene.webp",
    targets,
  });
});
afterAll(async () => {
  delete process.env.CONTENT_ROOT;
  await fs.rm(tmp, { recursive: true, force: true });
});
describe("숨은그림 콘텐츠 계약", () => {
  it("한 장과 목표 일곱 개를 검사하고 모든 목표를 내보낸다", async () => {
    const game = await c.inspect("hidden-test");
    expect(game.names).toHaveLength(11);
    const { entries } = await c.exportGames();
    expect(entries[0].kind).toBe("hidden");
    expect(entries[0]).not.toHaveProperty("modified");
    expect(entries[0].targetImages).toHaveLength(7);
    const raw = JSON.parse(
      await fs.readFile(path.join(tmp, "public/catalog.json"), "utf8"),
    );
    expect(raw.games).toHaveLength(0);
    expect(raw.hiddenGames).toHaveLength(1);
    await fs.cp(path.join(tmp, "public"), path.join(tmp, "dist"), {
      recursive: true,
    });
    await fs.writeFile(path.join(tmp, "dist/sw.js"), "// no precache");
    await c.audit();
    await fs.unlink(path.join(tmp, "dist", entries[0].targetImages[0]));
    await expect(c.audit()).rejects.toThrow("필수 파일 누락");
  });
  it("목록의 종류 분리와 표시 정보가 원본과 다르면 거부한다", async () => {
    await c.exportGames();
    await fs.rm(path.join(tmp, "dist"), { recursive: true, force: true });
    await fs.cp(path.join(tmp, "public"), path.join(tmp, "dist"), {
      recursive: true,
    });
    await fs.writeFile(path.join(tmp, "dist/sw.js"), "// no precache");
    const file = path.join(tmp, "dist/catalog.json");
    const raw = JSON.parse(await fs.readFile(file, "utf8"));
    const wrongTitle = structuredClone(raw);
    wrongTitle.hiddenGames[0].title = "다른 제목";
    await fs.writeFile(file, JSON.stringify(wrongTitle));
    await expect(c.audit()).rejects.toThrow("카탈로그 정보");
    const wrongKind = structuredClone(raw);
    wrongKind.games = wrongKind.hiddenGames;
    wrongKind.hiddenGames = [];
    await fs.writeFile(file, JSON.stringify(wrongKind));
    await expect(c.audit()).rejects.toThrow("종류별");
    await fs.writeFile(file, JSON.stringify(raw));
    await c.audit();
  });
  it("목표 이름 수정은 기록을 유지하고 좌표 수정은 해당 진행 버전을 바꾼다", async () => {
    const before = await c.inspect("hidden-test"),
      puzzle = await read("puzzle.json");
    puzzle.targets[0].label = "새 이름";
    await write("puzzle.json", puzzle);
    expect((await c.inspect("hidden-test")).gameplayRevision).toBe(
      before.gameplayRevision,
    );
    puzzle.targets[0].area.y = 0.4;
    await write("puzzle.json", puzzle);
    expect((await c.inspect("hidden-test")).gameplayRevision).not.toBe(
      before.gameplayRevision,
    );
  });
  it("배경이 포함된 목표 그림을 거부한다", async () => {
    const target = path.join(dir, "target-0.png");
    const before = await fs.readFile(target);
    await sharp({
      create: { width: 96, height: 96, channels: 3, background: "green" },
    })
      .png()
      .toFile(target);
    await expect(c.inspect("hidden-test")).rejects.toThrow("배경 없는 투명");
    await fs.writeFile(target, before);
  });
  it("목표 누락·중복 이미지·잘못된 영역·종류 혼합을 거부한다", async () => {
    const original = await read("puzzle.json");
    const p = structuredClone(original);
    p.targets.pop();
    await write("puzzle.json", p);
    await expect(c.inspect("hidden-test")).rejects.toThrow("정답 수");
    const duplicate = structuredClone(original);
    duplicate.targets[1].image = duplicate.targets[0].image;
    await write("puzzle.json", duplicate);
    await expect(c.inspect("hidden-test")).rejects.toThrow("파일 이름");
    const outside = structuredClone(original);
    outside.targets[0].area.x = -1;
    await write("puzzle.json", outside);
    await expect(c.inspect("hidden-test")).rejects.toThrow("범위");
    const mixed = structuredClone(original);
    delete mixed.kind;
    await write("puzzle.json", mixed);
    await expect(c.inspect("hidden-test")).rejects.toThrow("종류");
    await write("puzzle.json", original);
  });
});

import { beforeAll, afterAll, describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";
let tmp: string, c: any;
beforeAll(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "kkokkok-content-"));
  process.env.CONTENT_ROOT = tmp;
  c = await import("../scripts/content.mjs");
  const dir = path.join(tmp, "content/games/test");
  await fs.mkdir(dir, { recursive: true });
  await sharp({
    create: { width: 100, height: 100, channels: 3, background: "red" },
  })
    .png()
    .toFile(dir + "/original.png");
  await sharp({
    create: { width: 100, height: 100, channels: 3, background: "green" },
  })
    .png()
    .toFile(dir + "/modified.png");
  await sharp(dir + "/original.png")
    .webp()
    .toFile(dir + "/thumbnail.webp");
  await fs.writeFile(
    dir + "/metadata.json",
    JSON.stringify({
      schemaVersion: 1,
      id: "test",
      theme: "동물",
      difficulty: "easy",
      title: "테스트",
      thumbnail: "thumbnail.webp",
    }),
  );
  await fs.writeFile(
    dir + "/puzzle.json",
    JSON.stringify({
      schemaVersion: 1,
      id: "test",
      width: 100,
      height: 100,
      original: "original.png",
      modified: "modified.png",
      differences: Array.from({ length: 7 }, (_, i) => ({
        id: "d" + i,
        description: "차이",
        left: { x: 0.5, y: 0.5, rx: 0.1, ry: 0.1 },
        right: { x: 0.5, y: 0.5, rx: 0.1, ry: 0.1 },
      })),
    }),
  );
});
afterAll(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
  delete process.env.CONTENT_ROOT;
});
describe("등록 콘텐츠 내보내기와 산출물 검사", () => {
  it("승인 기록 없이 등록된 게임 전체를 내보낸다", async () => {
    const r = await c.exportGames();
    expect(r.entries).toHaveLength(1);
    expect(r.entries[0]).not.toHaveProperty("draft");
    const catalog = JSON.parse(
      await fs.readFile(path.join(tmp, "public/catalog.json"), "utf8"),
    );
    expect(catalog).not.toHaveProperty("draftPreview");
  });
  it("과거 미승인 기록은 등록 콘텐츠를 제외하지 않는다", async () => {
    await fs.mkdir(path.join(tmp, "reviews"), { recursive: true });
    await fs.writeFile(
      path.join(tmp, "reviews/test.json"),
      JSON.stringify({ approved: false, hashes: {} }),
    );
    expect((await c.exportGames()).entries).toHaveLength(1);
  });
  it("제목 변경은 진행 버전을 유지하고 새 빌드에 반영한다", async () => {
    const before = await c.inspect("test"),
      file = path.join(tmp, "content/games/test/metadata.json"),
      m = JSON.parse(await fs.readFile(file, "utf8"));
    m.title = "변경";
    await fs.writeFile(file, JSON.stringify(m));
    const after = await c.inspect("test");
    expect(after.gameplayRevision).toBe(before.gameplayRevision);
    expect(after.contentRevision).not.toBe(before.contentRevision);
    expect((await c.exportGames()).entries[0].title).toBe("변경");
  });
  it("정답 영역 변경은 진행 버전을 변경한다", async () => {
    const before = await c.inspect("test"),
      file = path.join(tmp, "content/games/test/puzzle.json"),
      p = JSON.parse(await fs.readFile(file, "utf8"));
    p.differences[0].left.x = 0.4;
    await fs.writeFile(file, JSON.stringify(p));
    expect((await c.inspect("test")).gameplayRevision).not.toBe(
      before.gameplayRevision,
    );
  });
  it("배포 산출물의 누락과 비공개 파일을 거부한다", async () => {
    const g = await c.inspect("test");
    await c.exportGames();
    await fs.cp(path.join(tmp, "public"), path.join(tmp, "dist"), {
      recursive: true,
    });
    await fs.writeFile(path.join(tmp, "dist/sw.js"), "// no game precache");
    await c.audit();
    const target = path.join(
      tmp,
      "dist/games/test",
      g.contentRevision,
      "original.png",
    );
    await fs.unlink(target);
    await expect(c.audit()).rejects.toThrow("필수 파일 누락");
    await fs.copyFile(path.join(g.dir, "original.png"), target);
    await fs.writeFile(path.join(tmp, "dist/private.json"), "{}");
    await expect(c.audit()).rejects.toThrow("허용 목록");
    await fs.unlink(path.join(tmp, "dist/private.json"));
  });
  it("기본 구성 18개가 부족하면 첫 공개 배포를 중단한다", async () => {
    await expect(c.releaseCheck()).rejects.toThrow("18개");
  });
  it("게임 추가 후에는 이전 빌드의 누락을 감지한다", async () => {
    const extra = path.join(tmp, "content/games/extra");
    await fs.cp(path.join(tmp, "content/games/test"), extra, {
      recursive: true,
    });
    for (const filename of ["metadata.json", "puzzle.json"]) {
      const file = path.join(extra, filename);
      const value = JSON.parse(await fs.readFile(file, "utf8"));
      value.id = "extra";
      await fs.writeFile(file, JSON.stringify(value));
    }
    await expect(c.audit()).rejects.toThrow("게임 목록 변경");
    await fs.rm(extra, { recursive: true });
  });
  it("수동 승인이나 실제 기기 확인 기록 없이 자동 배포 검사를 수행한다", async () => {
    const ids: string[] = [];
    for (const theme of c.themes)
      for (const [level, count] of Object.entries(c.counts)) {
        const id = `fixture-${ids.length}`;
        ids.push(id);
        const dir = path.join(tmp, "content/games", id);
        await fs.cp(path.join(tmp, "content/games/test"), dir, {
          recursive: true,
        });
        const meta = JSON.parse(
          await fs.readFile(path.join(dir, "metadata.json"), "utf8"),
        );
        Object.assign(meta, { id, theme, difficulty: level });
        const puzzle = JSON.parse(
          await fs.readFile(path.join(dir, "puzzle.json"), "utf8"),
        );
        puzzle.id = id;
        puzzle.differences = Array.from(
          { length: count as number },
          (_, i) => ({ ...puzzle.differences[0], id: `d${i}` }),
        );
        await fs.writeFile(
          path.join(dir, "metadata.json"),
          JSON.stringify(meta),
        );
        await fs.writeFile(
          path.join(dir, "puzzle.json"),
          JSON.stringify(puzzle),
        );
      }
    await c.exportGames();
    await fs.rm(path.join(tmp, "dist"), { recursive: true });
    await fs.cp(path.join(tmp, "public"), path.join(tmp, "dist"), {
      recursive: true,
    });
    await fs.writeFile(path.join(tmp, "dist/sw.js"), "// no game precache");
    expect((await c.releaseCheck()).games).toHaveLength(19);
    for (const id of ids)
      await fs.rm(path.join(tmp, "content/games", id), { recursive: true });
  });
  it("개수와 좌표가 잘못된 데이터는 거부한다", async () => {
    const file = path.join(tmp, "content/games/test/puzzle.json"),
      p = JSON.parse(await fs.readFile(file, "utf8"));
    p.differences.pop();
    await fs.writeFile(file, JSON.stringify(p));
    await expect(c.inspect("test")).rejects.toThrow("정답 수");
    p.differences.push({
      ...p.differences[0],
      id: "other",
      left: { x: -1, y: 0.5, rx: 0.1, ry: 0.1 },
    });
    await fs.writeFile(file, JSON.stringify(p));
    await expect(c.inspect("test")).rejects.toThrow("범위");
  });
  it("경로 탈출 게임 ID를 거부한다", () => {
    expect(() => c.validId("../reviews")).toThrow();
  });
});

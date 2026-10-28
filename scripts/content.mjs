import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
export const themes = ["동물", "우주", "공주", "동화", "교통", "일상"];
export const counts = { easy: 7, medium: 8, hard: 10 };
const root = path.resolve(process.env.CONTENT_ROOT || ".");
const gamesDir = path.join(root, "content/games");
export const hash = (data) =>
  crypto.createHash("sha256").update(data).digest("hex");
export const json = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const write = async (file, data) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n");
};
export function validId(id) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id || ""))
    throw new Error("게임 ID는 영문 소문자·숫자·하이픈만 사용합니다.");
  return id;
}
const safeFile = (name) => {
  if (!/^[a-zA-Z0-9_-]+\.(png|webp|jpg|jpeg)$/.test(name || ""))
    throw new Error("허용되지 않은 이미지 파일명");
  return name;
};
const assert = (test, message) => {
  if (!test) throw new Error(message);
};
export function contentNames(puzzle, meta) {
  const hidden = puzzle.kind === "hidden";
  return [
    safeFile(puzzle.original),
    ...(hidden
      ? puzzle.targets.map((t) => safeFile(t.image))
      : [safeFile(puzzle.modified)]),
    safeFile(meta.thumbnail),
    "puzzle.json",
    "metadata.json",
  ];
}
export async function inspect(id) {
  validId(id);
  const dir = path.join(gamesDir, id),
    puzzle = await json(path.join(dir, "puzzle.json")),
    meta = await json(path.join(dir, "metadata.json"));
  assert(
    puzzle.schemaVersion === 1 && meta.schemaVersion === 1,
    "schemaVersion은 1이어야 합니다.",
  );
  assert(puzzle.id === id && meta.id === id, "게임 ID 불일치");
  const kind = meta.kind || "differences";
  assert(
    ["differences", "hidden"].includes(kind) &&
      (puzzle.kind || "differences") === kind,
    "게임 종류 불일치",
  );
  const hidden = kind === "hidden";
  assert(
    themes.includes(meta.theme) && Object.hasOwn(counts, meta.difficulty),
    "주제 또는 난이도 오류",
  );
  assert(
    typeof meta.title === "string" &&
      meta.title.trim().length > 0 &&
      meta.title.length <= 60,
    "제목은 1~60자",
  );
  const answers = hidden ? puzzle.targets : puzzle.differences;
  assert(
    Array.isArray(answers) && answers.length === counts[meta.difficulty],
    "난이도별 정답 수 불일치",
  );
  assert(
    Number.isInteger(puzzle.width) &&
      Number.isInteger(puzzle.height) &&
      puzzle.width > 0 &&
      puzzle.height > 0,
    "이미지 크기 오류",
  );
  const seen = new Set();
  for (const d of answers) {
    assert(
      typeof d.id === "string" && d.id.length > 0 && !seen.has(d.id),
      "정답 ID 중복 또는 누락",
    );
    seen.add(d.id);
    const label = hidden ? d.label : d.description;
    assert(
      typeof label === "string" && label.trim().length > 0,
      "정답 설명 누락",
    );
    for (const a of hidden ? [d.area] : [d.left, d.right]) {
      assert(
        a && ["x", "y", "rx", "ry"].every((k) => Number.isFinite(a[k])),
        "정답 좌표 누락",
      );
      assert(
        a.rx > 0 &&
          a.ry > 0 &&
          a.x - a.rx >= 0 &&
          a.x + a.rx <= 1 &&
          a.y - a.ry >= 0 &&
          a.y + a.ry <= 1,
        "정답 영역이 이미지 범위를 벗어남",
      );
    }
  }
  const names = contentNames(puzzle, meta);
  assert(
    new Set(names).size === names.length,
    "이미지 파일 이름이 서로 달라야 합니다.",
  );
  const hashes = {};
  for (const name of names) {
    const file = path.join(dir, name);
    assert((await fs.lstat(file)).isFile(), "일반 파일만 허용합니다.");
    const data = await fs.readFile(file);
    assert(data.length <= 25 * 1024 * 1024, "파일당 25 MiB 제한 초과");
    hashes[name] = hash(data);
  }
  for (const name of hidden
    ? [puzzle.original]
    : [puzzle.original, puzzle.modified]) {
    const info = await sharp(path.join(dir, name)).metadata();
    assert(
      info.width === puzzle.width && info.height === puzzle.height,
      "원본·변경 이미지 크기 불일치",
    );
  }
  for (const name of [
    meta.thumbnail,
    ...(hidden ? puzzle.targets.map((t) => t.image) : []),
  ]) {
    const info = await sharp(path.join(dir, name)).metadata();
    assert(info.width > 0 && info.height > 0, "목표 이미지 또는 썸네일 오류");
    if (hidden && name !== meta.thumbnail) {
      const alpha = info.hasAlpha
        ? (await sharp(path.join(dir, name)).stats()).channels.at(-1)
        : undefined;
      assert(
        alpha &&
          alpha.min === 0 &&
          alpha.max > 0 &&
          alpha.mean > 5 &&
          alpha.mean < 230,
        "목표 그림은 배경 없는 투명 이미지여야 합니다.",
      );
    }
  }
  const gameplay = hidden
    ? {
        kind,
        original: hashes[puzzle.original],
        width: puzzle.width,
        height: puzzle.height,
        targets: puzzle.targets.map(({ id, image, area }) => ({
          id,
          image: hashes[image],
          area,
        })),
      }
    : {
        original: hashes[puzzle.original],
        modified: hashes[puzzle.modified],
        width: puzzle.width,
        height: puzzle.height,
        differences: puzzle.differences.map(({ id, left, right }) => ({
          id,
          left,
          right,
        })),
      };
  const gameplayRevision = hash(JSON.stringify(gameplay)).slice(0, 20);
  const contentRevision = hash(JSON.stringify(hashes)).slice(0, 20);
  return {
    id,
    dir,
    puzzle,
    meta,
    names,
    hashes,
    gameplayRevision,
    contentRevision,
  };
}
export async function allGames() {
  try {
    return (await fs.readdir(gamesDir, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}
export async function check() {
  const games = [];
  for (const id of await allGames()) games.push(await inspect(id));
  return games;
}
export function catalogEntry(game) {
  const relative = `/games/${game.id}/${game.contentRevision}`;
  return {
    ...game.meta,
    gameplayRevision: game.gameplayRevision,
    contentRevision: game.contentRevision,
    puzzleUrl: relative + "/puzzle.json",
    original: relative + "/" + game.puzzle.original,
    ...(game.puzzle.kind === "hidden"
      ? {
          targetImages: game.puzzle.targets.map(
            (t) => relative + "/" + t.image,
          ),
        }
      : { modified: relative + "/" + game.puzzle.modified }),
    thumbnail: relative + "/" + game.meta.thumbnail,
  };
}
export async function exportGames() {
  const games = await check(),
    out = path.join(root, "public/games");
  await fs.rm(out, { recursive: true, force: true });
  await fs.mkdir(out, { recursive: true });
  const entries = [];
  for (const game of games) {
    const target = path.join(out, game.id, game.contentRevision);
    await fs.mkdir(target, { recursive: true });
    for (const name of game.names)
      await fs.copyFile(path.join(game.dir, name), path.join(target, name));
    entries.push(catalogEntry(game));
  }
  const releaseId = hash(JSON.stringify(entries) + Date.now()).slice(0, 16);
  await write(path.join(root, "public/catalog.json"), {
    schemaVersion: 1,
    releaseId,
    // Backward compatibility: old clients never receive a game type they cannot play.
    games: entries.filter((entry) => entry.kind !== "hidden"),
    hiddenGames: entries.filter((entry) => entry.kind === "hidden"),
  });
  return { entries, releaseId };
}
export async function audit() {
  const stored = await json(path.join(root, "dist/catalog.json"));
  assert(
    stored.schemaVersion === 1 &&
      Array.isArray(stored.games) &&
      (stored.hiddenGames === undefined || Array.isArray(stored.hiddenGames)),
    "카탈로그 형식 오류",
  );
  assert(
    stored.games.every((g) => g.kind !== "hidden") &&
      (stored.hiddenGames || []).every((g) => g.kind === "hidden"),
    "게임 종류별 카탈로그 분리 오류",
  );
  const catalog = {
    ...stored,
    games: [...stored.games, ...(stored.hiddenGames || [])],
  };
  const sourceGames = await check();
  assert(
    catalog.games.length === sourceGames.length &&
      new Set(catalog.games.map((g) => g.id)).size === sourceGames.length &&
      sourceGames.every((g) =>
        catalog.games.some((entry) => entry.id === g.id),
      ),
    "빌드 이후 게임 목록 변경 감지: 다시 빌드하세요.",
  );
  const allowed = new Set();
  for (const entry of catalog.games) {
    const game = await inspect(entry.id);
    assert(
      game.contentRevision === entry.contentRevision,
      "빌드 이후 파일 변경 감지",
    );
    const expected = catalogEntry(game);
    assert(
      Object.keys(entry).length === Object.keys(expected).length &&
        Object.keys(expected).every(
          (key) => JSON.stringify(entry[key]) === JSON.stringify(expected[key]),
        ),
      "카탈로그 정보 불일치",
    );
    for (const name of game.names)
      allowed.add(`games/${game.id}/${game.contentRevision}/${name}`);
  }
  async function walk(dir, prefix = "") {
    const output = [];
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const rel = prefix + e.name;
      if (e.isDirectory())
        output.push(...(await walk(path.join(dir, e.name), rel + "/")));
      else {
        assert(e.isFile(), "배포 산출물에 일반 파일이 아닌 항목");
        output.push(rel);
      }
    }
    return output;
  }
  const files = await walk(path.join(root, "dist"));
  for (const f of allowed)
    assert(files.includes(f), "배포 필수 파일 누락: " + f);
  for (const f of files)
    assert(
      allowed.has(f) ||
        [
          "catalog.json",
          "index.html",
          "manifest.webmanifest",
          "sw.js",
          "icon.svg",
          "icon-192.png",
          "icon-512.png",
          "_headers",
          "font-license.txt",
          "mode-differences-left.webp",
          "mode-differences-right.webp",
        ].includes(f) ||
        /^assets\/[a-zA-Z0-9_.-]+\.(js|css|woff|woff2)$/.test(f),
      "배포 허용 목록 밖 파일: " + f,
    );
  for (const f of files) {
    assert(
      !/(review|verification|SKILL|\.env|\.md$)/i.test(f),
      "비공개 파일이 배포에 포함됨: " + f,
    );
    if (f.startsWith("games/")) {
      assert(allowed.has(f), "등록되지 않은 파일: " + f);
      const match = catalog.games.find((g) =>
        f.startsWith(`games/${g.id}/${g.contentRevision}/`),
      );
      const game = await inspect(match.id);
      assert(
        hash(await fs.readFile(path.join(root, "dist", f))) ===
          game.hashes[path.basename(f)],
        "산출물 해시 불일치",
      );
    }
  }
  assert(files.length <= 20000, "Cloudflare 파일 수 초과");
  for (const f of files)
    assert(
      (await fs.stat(path.join(root, "dist", f))).size <= 25 * 1024 * 1024,
      "Cloudflare 파일 크기 초과",
    );
  const sw = await fs.readFile(path.join(root, "dist/sw.js"), "utf8");
  assert(
    !sw.includes("/games/"),
    "게임 전체를 서비스 워커 사전 캐시에 포함하면 안 됩니다.",
  );
  return catalog;
}
export async function releaseCheck() {
  const catalog = await audit();
  assert(catalog.games.length >= 18, "첫 공개에 기본 게임 18개가 필요합니다.");
  for (const theme of themes)
    for (const difficulty of Object.keys(counts))
      assert(
        catalog.games.some(
          (g) => g.theme === theme && g.difficulty === difficulty,
        ),
        "주제·난이도 누락: " + theme + " " + difficulty,
      );
  return catalog;
}
async function main() {
  const [cmd, id, ...args] = process.argv.slice(2);
  if (cmd === "check") {
    const g = await check();
    console.log(`${g.length}개 게임 데이터 검사 통과`);
  } else if (cmd === "export") {
    const r = await exportGames();
    console.log(`${r.entries.length}개 등록 게임 내보내기`);
  } else if (cmd === "audit") {
    const c = await audit();
    console.log(`배포 산출물 ${c.games.length}개 게임 검사 통과`);
  } else if (cmd === "release-check") {
    await releaseCheck();
    console.log("콘텐츠·빌드 자동 검사 통과");
  } else if (cmd === "init") {
    validId(id);
    const [theme, difficulty, title] = args;
    assert(
      themes.includes(theme) && Object.hasOwn(counts, difficulty),
      "init <id> <주제> <easy|medium|hard> <제목>",
    );
    const dir = path.join(root, "work/content", id);
    await fs.mkdir(dir, { recursive: true });
    assert(!(await fs.readdir(dir)).length, "기존 결과를 덮어쓸 수 없습니다.");
    await write(path.join(dir, "metadata.json"), {
      schemaVersion: 1,
      id,
      title: title || theme + " 그림 찾기",
      theme,
      difficulty,
      thumbnail: "thumbnail.webp",
    });
    await write(path.join(dir, "puzzle.json"), {
      schemaVersion: 1,
      id,
      width: 1536,
      height: 1024,
      original: "original.png",
      modified: "modified.png",
      differences: [],
    });
    console.log(dir);
  } else if (cmd === "stage") {
    validId(id);
    const source = path.join(root, "work/content", id),
      target = path.join(gamesDir, id);
    const puzzle = await json(path.join(source, "puzzle.json")),
      meta = await json(path.join(source, "metadata.json"));
    const names = contentNames(puzzle, meta);
    let existing = false;
    try {
      await fs.access(target);
      existing = true;
    } catch {}
    assert(
      !existing || args.includes("--replace"),
      "기존 게임은 새 시도 결과를 확인한 뒤 --replace로 교체하세요.",
    );
    const backup = target + ".previous";
    if (existing) {
      await fs.rm(backup, { recursive: true, force: true });
      await fs.rename(target, backup);
    }
    try {
      await fs.mkdir(target, { recursive: true });
      for (const name of names)
        await fs.copyFile(path.join(source, name), path.join(target, name));
      await inspect(id);
      if (existing) {
        const archive = path.join(root, "work/archive", id + "-" + Date.now());
        await fs.mkdir(path.dirname(archive), { recursive: true });
        await fs.rename(backup, archive);
      }
      console.log(id + " 등록 완료");
    } catch (e) {
      await fs.rm(target, { recursive: true, force: true });
      if (existing) await fs.rename(backup, target);
      throw e;
    }
  } else if (cmd === "review-image") {
    const g = await inspect(id);
    const ellipse = (d, side) => {
      const a = g.puzzle.kind === "hidden" ? d.area : d[side];
      return `<ellipse cx="${a.x * g.puzzle.width}" cy="${a.y * g.puzzle.height}" rx="${a.rx * g.puzzle.width}" ry="${a.ry * g.puzzle.height}" fill="none" stroke="#e12828" stroke-width="5"/>`;
    };
    const inputs = [];
    for (const side of g.puzzle.kind === "hidden"
      ? ["left"]
      : ["left", "right"]) {
      const name = side === "left" ? g.puzzle.original : g.puzzle.modified;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${g.puzzle.width}" height="${g.puzzle.height}">${(g.puzzle.kind === "hidden" ? g.puzzle.targets : g.puzzle.differences).map((d) => ellipse(d, side)).join("")}</svg>`;
      inputs.push(
        await sharp(path.join(g.dir, name))
          .composite([{ input: Buffer.from(svg) }])
          .png()
          .toBuffer(),
      );
    }
    const out = path.join(
      root,
      "work",
      g.puzzle.kind === "hidden" ? "hidden-content" : "content",
      id,
      "review.png",
    );
    await fs.mkdir(path.dirname(out), { recursive: true });
    await sharp({
      create: {
        width: g.puzzle.width * inputs.length,
        height: g.puzzle.height,
        channels: 4,
        background: "#ffffff",
      },
    })
      .composite([
        { input: inputs[0], left: 0, top: 0 },
        ...(inputs[1]
          ? [{ input: inputs[1], left: g.puzzle.width, top: 0 }]
          : []),
      ])
      .png()
      .toFile(out);
    console.log(out);
  } else if (cmd === "batch") {
    const plan = [];
    let i = 1;
    const requested = id === "all" ? themes : [id];
    assert(
      requested.every((t) => themes.includes(t)),
      "batch <주제|all> [easy|medium|hard|all] [개수]",
    );
    const levels =
        args[0] === "all" || !args[0] ? Object.keys(counts) : [args[0]],
      amount = Number(args[1] || 1);
    assert(
      levels.every((l) => Object.hasOwn(counts, l)) &&
        Number.isInteger(amount) &&
        amount >= 1 &&
        amount <= 18,
      "일괄 입력 오류 (한 요청당 1~18개)",
    );
    for (const theme of requested)
      for (const difficulty of levels)
        for (let n = 0; n < amount; n++)
          plan.push({
            id: `${["animals", "space", "princess", "fairytale", "transport", "daily"][themes.indexOf(theme)]}-${difficulty}-${Date.now().toString(36)}-${i++}`,
            theme,
            difficulty,
            status: "pending",
            scene: "",
          });
    const file = path.join(root, "work/batches", Date.now() + ".json");
    await write(file, { schemaVersion: 1, items: plan });
    console.log(file);
  } else if (cmd === "batch-status") {
    const file = path.resolve(id);
    assert(
      file.startsWith(path.join(root, "work/batches") + path.sep),
      "work/batches 내 계획만 수정할 수 있습니다.",
    );
    const [gameId, status, ...message] = args;
    assert(
      ["pending", "generated", "failed", "reviewed"].includes(status),
      "상태 오류",
    );
    const b = await json(file),
      item = b.items.find((i) => i.id === gameId);
    assert(item, "계획에 게임 없음");
    item.status = status;
    item.message = message.join(" ");
    await write(file, b);
  } else
    console.log(
      "content 명령: init / stage / check / export / review-image / batch / batch-status / audit / release-check",
    );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });

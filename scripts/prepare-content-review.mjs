import fs from "node:fs/promises";
import path from "node:path";
import { check, themes, counts } from "./content.mjs";
const games = await check();
const answers = (g) =>
  g.puzzle.kind === "hidden" ? g.puzzle.targets : g.puzzle.differences;
const folder = (g) =>
  g.puzzle.kind === "hidden" ? "hidden-content" : "content";
const kindName = (g) =>
  g.puzzle.kind === "hidden" ? "숨은그림찾기" : "틀린그림찾기";
const levels = { easy: "쉬움", medium: "보통", hard: "어려움" };
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
const rows = themes
  .flatMap((theme) =>
    Object.keys(counts).flatMap((level) =>
      games.filter(
        (g) => g.meta.theme === theme && g.meta.difficulty === level,
      ),
    ),
  )
  .filter(Boolean);
const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>그림콕콕 콘텐츠 검수</title><style>body{margin:0;background:#f8f3e9;color:#283b35;font:18px/1.6 system-ui,sans-serif}main{max-width:1200px;margin:auto;padding:32px}h1{margin:0}p{max-width:900px}nav{display:flex;gap:12px;flex-wrap:wrap}nav a, .links a{padding:10px 16px;border-radius:12px;background:#205b49;color:white;text-decoration:none;display:inline-block}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}article{background:white;padding:18px;border-radius:20px;border:1px solid #dedacf}img{width:100%;border-radius:12px}h2{margin-top:40px}h3{margin:12px 0 4px}.tag{font-size:15px;color:#53685f}.links{display:flex;gap:8px;flex-wrap:wrap}.links a{font-size:16px}details{margin-top:12px}ol{padding-left:25px}.status{border-left:5px solid #df9a33;padding:12px 16px;background:#fff5d9}</style><main><h1>그림콕콕 · 콘텐츠 검수</h1><p class="status">틀린그림찾기와 숨은그림찾기 총 ${games.length}개를 준비했습니다. 등록된 게임은 별도 승인 없이 빌드에 포함됩니다. 이 화면은 그림과 정답을 확인하는 선택 자료이며 공개 빌드에 포함되지 않습니다.</p><p>① 정답 표시 이미지에서 실제 모양과 표시 영역을 비교하세요. ② 틀린그림찾기는 양쪽 정답을, 숨은그림찾기는 목표 그림의 일치를 확인하세요. ③ 실제 게임에서 정답·힌트·확대를 확인하세요.</p><nav>${themes.map((t) => `<a href="#${esc(t)}">${esc(t)}</a>`).join("")}<a href="/">게임 홈</a></nav>${themes
  .map(
    (t) =>
      `<section id="${esc(t)}"><h2>${esc(t)}</h2><div class="grid">${rows
        .filter((g) => g.meta.theme === t)
        .map(
          (g) =>
            `<article><img loading="lazy" src="/content/games/${g.id}/${g.meta.thumbnail}" alt="${esc(g.meta.title)}"><h3>${esc(g.meta.title)}</h3><p class="tag">${levels[g.meta.difficulty]} · ${answers(g).length}개 · ${kindName(g)}</p><div class="links"><a target="_blank" href="/work/${folder(g)}/${g.id}/review.png">정답 표시 이미지</a><a target="_blank" href="/?game=${g.id}">실제 게임 열기</a><a target="_blank" href="/work/${folder(g)}/${g.id}/game-landscape.png">가로 화면 캡처</a><a target="_blank" href="/work/${folder(g)}/${g.id}/game-portrait.png">세로 화면 캡처</a></div><details><summary>정답 목록 확인</summary><ol>${answers(
              g,
            )
              .map((d) => `<li>${esc(d.label || d.description)}</li>`)
              .join("")}</ol></details></article>`,
        )
        .join("")}</div></section>`,
  )
  .join("")}</main></html>`;
await fs.mkdir("work/content-expansion", { recursive: true });
await fs.writeFile("work/content-expansion/review.html", html);
await fs.writeFile(
  "docs/CONTENT-REVIEW.md",
  `# 콘텐츠 검수\n\n기존 틀린그림찾기는 4:5 비교 그림을 사용하며, 숨은그림찾기는 가로 장면 한 장과 목표 목록을 사용한다. 현재 등록 게임은 ${games.length}개다. 등록된 게임은 별도 승인 없이 빌드에 포함된다. 공개 배포는 별도 명령으로 실행한다.\n\n\`npm run dev\` 실행 후 [로컬 검수 목록](http://127.0.0.1:5173/work/content-expansion/review.html)을 열면 검수 이미지·실제 게임·게임 화면 캡처를 확인할 수 있다.\n\n| 주제 | 난이도 | 제목 | 검수 이미지 | 실제 게임 |\n|---|---|---|---|---|\n` +
    rows
      .map(
        (g) =>
          `| ${g.meta.theme} | ${levels[g.meta.difficulty]} (${answers(g).length}개) | ${g.meta.title} | [보기](../work/${folder(g)}/${g.id}/review.png) | [플레이](http://127.0.0.1:5173/?game=${g.id}) |`,
      )
      .join("\n") +
    "\n\n이 목록은 선택적인 품질 확인 자료다. 승인 명령 없이 등록된 게임 전체가 빌드에 포함된다.\n",
);
console.log(path.resolve("work/content-expansion/review.html"));

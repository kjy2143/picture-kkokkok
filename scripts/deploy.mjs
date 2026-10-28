import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import { releaseCheck } from "./content.mjs";
// Validate the existing build before upload; deployment remains an explicit action.
try {
  const catalog = await releaseCheck();
  if (process.argv.includes("--dry-run"))
    console.log("배포 검사 통과. 실제 업로드는 실행하지 않았습니다.");
  else {
    const result = spawnSync("npx", ["wrangler", "deploy"], {
      stdio: "inherit",
    });
    if (result.status !== 0)
      throw new Error(
        "배포 실패. 현재 공개 버전의 상태를 Cloudflare에서 확인하세요.",
      );
    await fs.mkdir("work/releases", { recursive: true });
    await fs.writeFile(
      `work/releases/${catalog.releaseId}.json`,
      JSON.stringify(
        {
          releaseId: catalog.releaseId,
          deployedAt: new Date().toISOString(),
          games: catalog.games.map((g) => ({
            id: g.id,
            revision: g.gameplayRevision,
          })),
        },
        null,
        2,
      ),
    );
  }
} catch (e) {
  console.error("공개 배포 중단: " + e.message);
  process.exitCode = 1;
}

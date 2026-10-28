import os from "node:os";

const addresses = Object.entries(os.networkInterfaces())
  .sort(([a], [b]) => (a === "en0" ? -1 : b === "en0" ? 1 : a.localeCompare(b)))
  .flatMap(([, items]) =>
    (items || [])
      .filter((item) => item.family === "IPv4" && !item.internal)
      .map((item) => item.address),
  );

console.log(
  "\niPad와 Mac을 같은 Wi-Fi에 연결한 뒤 Safari에서 아래 주소를 여세요.",
);
for (const address of [...new Set(addresses)]) {
  console.log(`게임: http://${address}:5173/`);
  console.log(
    `검수: http://${address}:5173/work/content-expansion/review.html`,
  );
}
if (!addresses.length)
  console.log("Mac의 Wi-Fi 연결 후 npm run dev를 다시 실행하세요.");
console.log(
  "이 HTTP 개발 연결은 화면·플레이 검수용입니다. 오프라인 PWA 검증에는 HTTPS가 필요합니다.\n",
);

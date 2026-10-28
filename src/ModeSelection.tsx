import type { Game, GameKind } from "./types";
export function ModeSelection({
  games,
  onChoose,
}: {
  games: Game[];
  onChoose: (kind: GameKind) => void;
}) {
  const hidden = games.find((g) => g.kind === "hidden");
  return (
    <section className="mode-selection">
      <div className="mode-welcome">
        <h1>
          오늘은 어떤 <span>놀이를 할까?</span>
        </h1>
        <p>하고 싶은 놀이를 골라봐요.</p>
      </div>
      <div className="mode-choices">
        <button
          className="mode-choice difference-choice"
          onClick={() => onChoose("differences")}
        >
          <div className="choice-preview comparison-preview" aria-hidden="true">
            <img src="/mode-differences-left.webp" alt="" />
            <img src="/mode-differences-right.webp" alt="" />
          </div>
          <div className="choice-copy">
            <h2>틀린그림찾기</h2>
            <p>두 그림에서 다른 곳을 콕!</p>
            <span>
              그림 고르기{" "}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h16m-7-7 7 7-7 7" />
              </svg>
            </span>
          </div>
        </button>
        <button
          className="mode-choice hidden-choice"
          onClick={() => onChoose("hidden")}
        >
          <div className="choice-preview hidden-preview" aria-hidden="true">
            {hidden && <img src={hidden.thumbnail} alt="" />}
            {!!hidden?.targetImages?.length && (
              <div className="choice-targets">
                {hidden.targetImages.slice(0, 3).map((src) => (
                  <img src={src} key={src} alt="" />
                ))}
              </div>
            )}
          </div>
          <div className="choice-copy">
            <h2>숨은그림찾기</h2>
            <p>그림 속에 숨은 물건을 콕!</p>
            <span>
              그림 고르기{" "}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h16m-7-7 7 7-7 7" />
              </svg>
            </span>
          </div>
        </button>
      </div>
    </section>
  );
}

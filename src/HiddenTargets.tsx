import type { CSSProperties } from "react";
import type { Game, HiddenPuzzle } from "./types";
import { targetImageUrl } from "./game";
export function HiddenTargets({
  game,
  puzzle,
  found,
  hint,
}: {
  game: Game;
  puzzle: HiddenPuzzle;
  found: string[];
  hint: string | null;
}) {
  return (
    <aside
      className="hidden-targets"
      aria-label="찾을 물건"
      style={
        {
          "--target-rows": Math.ceil(puzzle.targets.length / 2),
        } as CSSProperties
      }
    >
      <div className="target-heading">
        <h2>
          찾을 <span>물건</span>
        </h2>
        <p role="status">
          {found.length} / {puzzle.targets.length} <span>찾았어요</span>
        </p>
      </div>
      <ul className="target-list">
        {puzzle.targets.map((target) => {
          const done = found.includes(target.id);
          return (
            <li
              key={target.id}
              className={`${done ? "target-found" : ""} ${hint === target.id ? "target-hint" : ""}`}
            >
              <img src={targetImageUrl(game, target)} alt="" />
              <span>{target.label}</span>
              {done && (
                <span className="target-check" aria-label="찾았어요">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m5 12 4 4 10-10" />
                  </svg>
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="target-instruction">숨은 물건을 콕 눌러요.</p>
    </aside>
  );
}

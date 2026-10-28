import { useRef, useState, useEffect, useId } from "react";
import type { CSSProperties } from "react";
import type { Game, Puzzle, Area } from "./types";
import { hit, hitWithTolerance, puzzleAnswers } from "./game";
export function Board({
  game,
  puzzle,
  found,
  hint,
  onCorrect,
  onWrong,
  resetKey,
}: {
  game: Game;
  puzzle: Puzzle;
  found: string[];
  hint: string | null;
  onCorrect: (id: string) => void;
  onWrong: () => void;
  resetKey: number;
}) {
  const hidden = puzzle.kind === "hidden";
  const answers = puzzleAnswers(puzzle);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 }),
    [wrong, setWrong] = useState<{ side: string; x: number; y: number } | null>(
      null,
    );
  const [cursor, setCursor] = useState({ x: 0.5, y: 0.5 });
  const keyboardHelpId = useId();
  const pointers = useRef(new Map<number, { x: number; y: number }>()),
    gesture = useRef<
      | {
          start: { x: number; y: number };
          moved: boolean;
          multi: boolean;
          pen: boolean;
          last: { x: number; y: number };
          distance: number;
        }
      | undefined
    >(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    setView({ scale: 1, x: 0, y: 0 });
    clearTimeout(timer.current);
    setWrong(null);
    setCursor({ x: 0.5, y: 0.5 });
    pointers.current.clear();
    gesture.current = undefined;
  }, [resetKey]);
  useEffect(() => {
    const resize = () => setView({ scale: 1, x: 0, y: 0 });
    window.addEventListener("orientationchange", resize);
    return () => {
      window.removeEventListener("orientationchange", resize);
      clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    if (hint) {
      setView({ scale: 1, x: 0, y: 0 });
    }
  }, [hint]);
  const distance = () => {
    const p = [...pointers.current.values()];
    return p.length < 2 ? 0 : Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
  };
  const center = () => {
    const p = [...pointers.current.values()];
    return { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 };
  };
  function down(e: React.PointerEvent<SVGSVGElement>) {
    if (gesture.current?.pen && e.pointerType !== "pen") return;
    if (e.pointerType === "pen") {
      pointers.current.clear();
      gesture.current = undefined;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1)
      gesture.current = {
        start: { x: e.clientX, y: e.clientY },
        last: { x: e.clientX, y: e.clientY },
        moved: false,
        multi: false,
        pen: e.pointerType === "pen",
        distance: 0,
      };
    if (pointers.current.size === 2 && gesture.current) {
      gesture.current.multi = true;
      gesture.current.distance = distance();
      gesture.current.last = center();
    }
  }
  function move(e: React.PointerEvent<SVGSVGElement>) {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (Math.hypot(e.clientX - g.start.x, e.clientY - g.start.y) > 8)
      g.moved = true;
    if (pointers.current.size === 2) {
      const c = center(),
        d = distance(),
        r = e.currentTarget.getBoundingClientRect(),
        ratio = g.distance ? d / g.distance : 1;
      const previousX = (g.last.x - r.left) / r.width - 0.5,
        previousY = (g.last.y - r.top) / r.height - 0.5,
        nextX = (c.x - r.left) / r.width - 0.5,
        nextY = (c.y - r.top) / r.height - 0.5;
      setView((v) => {
        const scale = Math.max(1, Math.min(4, v.scale * ratio)),
          limit = (scale - 1) / 2,
          q = scale / v.scale;
        return {
          scale,
          x: Math.max(-limit, Math.min(limit, nextX - (previousX - v.x) * q)),
          y: Math.max(-limit, Math.min(limit, nextY - (previousY - v.y) * q)),
        };
      });
      g.last = c;
      g.distance = d;
    }
  }
  function up(e: React.PointerEvent<SVGSVGElement>, side: "left" | "right") {
    if (!pointers.current.has(e.pointerId)) return;
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (g && !g.multi && !g.moved && e.type !== "pointercancel") {
      const r = e.currentTarget.getBoundingClientRect(),
        x = ((e.clientX - r.left) / r.width - 0.5 - view.x) / view.scale + 0.5,
        y = ((e.clientY - r.top) / r.height - 0.5 - view.y) / view.scale + 0.5;
      const padding = e.pointerType === "pen" ? 8 : 22;
      select(side, x, y, {
        rx: padding / r.width / view.scale,
        ry: padding / r.height / view.scale,
      });
    }
    if (pointers.current.size === 0) gesture.current = undefined;
  }
  function select(
    side: "left" | "right",
    x: number,
    y: number,
    minimumRadius?: { rx: number; ry: number },
  ) {
    const difference =
      hidden && minimumRadius
        ? hitWithTolerance(answers, side, x, y, minimumRadius)
        : hit(answers, side, x, y);
    if (difference) {
      if (!found.includes(difference.id)) onCorrect(difference.id);
    } else {
      onWrong();
      setWrong({ side, x, y });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setWrong(null), 500);
    }
  }
  function keyDown(
    e: React.KeyboardEvent<SVGSVGElement>,
    side: "left" | "right",
  ) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const direction = directions[e.key];
    if (direction) {
      e.preventDefault();
      const step = (e.shiftKey ? 0.005 : 0.02) / view.scale;
      const next = {
        x: Math.max(0, Math.min(1, cursor.x + direction[0] * step)),
        y: Math.max(0, Math.min(1, cursor.y + direction[1] * step)),
      };
      setCursor(next);
      // Keep the selection visible in both pictures while zoomed in.
      setView((v) => {
        const limit = (v.scale - 1) / 2;
        const keepVisible = (coordinate: number, offset: number) => {
          const displayed = (coordinate - 0.5) * v.scale + offset + 0.5;
          const adjusted =
            offset + Math.max(0.06 - displayed, Math.min(0, 0.94 - displayed));
          return Math.max(-limit, Math.min(limit, adjusted));
        };
        return {
          ...v,
          x: keepVisible(next.x, v.x),
          y: keepVisible(next.y, v.y),
        };
      });
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!e.repeat) select(side, cursor.x, cursor.y);
    } else if (["+", "=", "-", "_"].includes(e.key)) {
      e.preventDefault();
      setView((v) => {
        const scale = Math.max(
          1,
          Math.min(4, v.scale + (["+", "="].includes(e.key) ? 0.5 : -0.5)),
        );
        const limit = (scale - 1) / 2;
        return {
          scale,
          x: Math.max(
            -limit,
            Math.min(limit, v.x + (cursor.x - 0.5) * (v.scale - scale)),
          ),
          y: Math.max(
            -limit,
            Math.min(limit, v.y + (cursor.y - 0.5) * (v.scale - scale)),
          ),
        };
      });
    }
  }
  const ring = (a: Area, key: string, isHint = false) => (
    <ellipse
      key={key}
      cx={a.x * puzzle.width}
      cy={a.y * puzzle.height}
      rx={a.rx * puzzle.width * (isHint ? 1.75 : 1.15)}
      ry={a.ry * puzzle.height * (isHint ? 1.75 : 1.15)}
      className={isHint ? "hint-ring" : "answer-ring"}
    />
  );
  return (
    <div
      className={hidden ? "boards single-board" : "boards"}
      style={{ "--board-ratio": puzzle.width / puzzle.height } as CSSProperties}
    >
      <p className="sr-only" id={keyboardHelpId}>
        방향키로 선택 위치를 움직이고 Enter 또는 Space로 선택해요. Shift와
        방향키를 함께 누르면 조금씩 움직여요. 더하기와 빼기 키로 확대·축소해요.
        Tab으로 다음 그림이나 버튼으로 이동해요.
      </p>
      {(hidden ? (["left"] as const) : (["left", "right"] as const)).map(
        (side, i) => (
          <section
            className="board-frame"
            key={side}
            aria-label={
              hidden ? "숨은그림" : i === 0 ? "첫 번째 그림" : "두 번째 그림"
            }
          >
            <svg
              className="board"
              role="application"
              aria-roledescription={
                hidden ? "숨은그림찾기 그림" : "틀린그림찾기 그림"
              }
              tabIndex={0}
              aria-label={
                hidden
                  ? "숨은 물건을 눌러보세요"
                  : `${i + 1}번째 그림, 다른 부분을 눌러보세요`
              }
              aria-describedby={keyboardHelpId}
              viewBox={`0 0 ${puzzle.width} ${puzzle.height}`}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={(e) => up(e, side)}
              onPointerCancel={(e) => up(e, side)}
              onKeyDown={(e) => keyDown(e, side)}
            >
              <g
                transform={`translate(${puzzle.width * (0.5 + view.x)},${puzzle.height * (0.5 + view.y)}) scale(${view.scale}) translate(${-puzzle.width / 2},${-puzzle.height / 2})`}
              >
                <image
                  href={i === 0 ? game.original : game.modified}
                  width={puzzle.width}
                  height={puzzle.height}
                />
                {answers
                  .filter((d) => found.includes(d.id))
                  .map((d) => ring(d[side], d.id))}
                {answers
                  .filter((d) => d.id === hint)
                  .map((d) => ring(d[side], "hint", true))}
                {wrong?.side === side && (
                  <circle
                    cx={wrong.x * puzzle.width}
                    cy={wrong.y * puzzle.height}
                    r={18 / view.scale}
                    className="wrong-ring"
                  />
                )}
                <svg
                  className="keyboard-cursor"
                  aria-hidden="true"
                  x={cursor.x * puzzle.width - 22 / view.scale}
                  y={cursor.y * puzzle.height - 22 / view.scale}
                  width={44 / view.scale}
                  height={44 / view.scale}
                  viewBox="-22 -22 44 44"
                  overflow="visible"
                >
                  <circle r="14" />
                  <path d="M-22 0h12M10 0h12M0-22v12M0 10v12" />
                </svg>
              </g>
            </svg>
            <span className="keyboard-tip" aria-hidden="true">
              방향키 이동 · Enter 선택 · Shift 미세 이동 · +/− 확대
            </span>
          </section>
        ),
      )}
    </div>
  );
}

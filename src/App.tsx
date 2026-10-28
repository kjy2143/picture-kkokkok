import { useEffect, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Board } from "./Board";
import { HiddenTargets } from "./HiddenTargets";
import { ModeSelection } from "./ModeSelection";
import {
  currentProgress,
  levelNames,
  countByLevel,
  gameKind,
  puzzleAnswers,
  targetImageUrl,
} from "./game";
import {
  getAllProgress,
  saveProgress,
  clearProgress,
  soundSetting,
  setSoundSetting,
} from "./storage";
import { cacheGame, isOfflineReady, deleteOfflineFiles } from "./cache";
import type {
  Catalog,
  Game,
  Progress,
  Puzzle,
  Difficulty,
  GameKind,
} from "./types";
function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    arrow: "M5 19 19 5M5 5h14v14",
    search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6",
    back: "m14 5-7 7 7 7",
    home: "m3 11 9-8 9 8M6 10v10h12V10",
    hint: "M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3",
    settings:
      "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
    check: "m5 12 4 4 10-10",
    sound: "M4 9h4l5-4v14l-5-4H4zM17 8a6 6 0 0 1 0 8",
    mute: "M4 9h4l5-4v14l-5-4H4zM17 9l5 6m0-6-5 6",
    help: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3M12 17h.01",
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon">
      <path d={paths[name] || paths.search} />
    </svg>
  );
}
export default function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [active, setActive] = useState<{ game: Game; puzzle: Puzzle } | null>(null),
    [progress, setProgress] = useState<Record<string, Progress>>({}),
    [ready, setReady] = useState<Record<string, boolean>>({}),
    [theme, setTheme] = useState("전체"),
    [difficulty, setDifficulty] = useState<Difficulty | "all">("all"),
    [loading, setLoading] = useState<string | null>(null),
    [settings, setSettings] = useState(false),
    [sound, setSound] = useState(true),
    [hint, setHint] = useState<string | null>(null),
    [resetKey, setResetKey] = useState(0),
    [confirmReset, setConfirmReset] = useState(false),
    [confirmRestart, setConfirmRestart] = useState(false),
    [completionDismissed, setCompletionDismissed] = useState(false),
    [helpOpen, setHelpOpen] = useState(false),
    [settingsBusy, setSettingsBusy] = useState<
      "sound" | "offline" | "reset" | null
    >(null),
    [settingMessages, setSettingMessages] = useState<
      Partial<Record<"sound" | "offline" | "reset", string>>
    >({});
  const resetTrigger = useRef<HTMLButtonElement>(null);
  const settingsBusyRef = useRef(settingsBusy);
  settingsBusyRef.current = settingsBusy;
  const completionOpen = !!(
    active &&
    progress[active.game.id]?.completed &&
    !completionDismissed
  );
  const [routeGameId, setRouteGameId] = useState(() =>
    new URLSearchParams(window.location.search).get("game"),
  );
  const [mode, setMode] = useState<GameKind | null>(() => {
    const value = new URLSearchParams(window.location.search).get("mode");
    return value === "hidden" || value === "differences" ? value : null;
  });
  const selectedKind =
    routeGameId && catalog?.games.find((g) => g.id === routeGameId)
      ? gameKind(catalog.games.find((g) => g.id === routeGameId)!)
      : mode;
  const navigationRequest = useRef(0);
  const current = useRef<Progress | null>(null),
    pending = useRef(Promise.resolve()),
    hintTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    audio = useRef<AudioContext | null>(null),
    returningHome = useRef(false);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError() {
      setNotice(
        "오프라인 준비를 마치지 못했어요. 인터넷에 연결해서 이용해주세요.",
      );
    },
  });
  async function bootstrap() {
    setError("");
    try {
      const response = await fetch("/catalog.json");
      if (!response.ok) throw new Error();
      const data: Catalog = await response.json();
      if (
        data.schemaVersion !== 1 ||
        !Array.isArray(data.games) ||
        (data.hiddenGames !== undefined && !Array.isArray(data.hiddenGames))
      )
        throw new Error();
      // Older app versions read only games; new clients also include hiddenGames.
      data.games = [...data.games, ...(data.hiddenGames || [])];
      const cached = await Promise.all(
        data.games.map(async (g) => [g.id, await isOfflineReady(g)] as const),
      );
      setReady(Object.fromEntries(cached));
      try {
        const stored = await getAllProgress();
        await Promise.all(
          data.games
            .filter((g) =>
              stored.some(
                (p) => p.id === g.id && p.revision !== g.gameplayRevision,
              ),
            )
            .map((g) => saveProgress(currentProgress(g))),
        );
        setProgress(
          Object.fromEntries(
            data.games.map((g) => [
              g.id,
              currentProgress(
                g,
                stored.find((p) => p.id === g.id),
              ),
            ]),
          ),
        );
        setSound(await soundSetting());
      } catch {
        setNotice("이 기기에 진행 기록을 저장하지 못할 수 있어요.");
      }
      if (import.meta.env.DEV && !window.isSecureContext)
        setNotice("이 개발 연결에서는 오프라인 저장을 사용할 수 없어요.");
      setCatalog(data);
    } catch {
      setError("게임 목록을 불러오지 못했어요. 인터넷 연결을 확인해주세요.");
    }
  }
  useEffect(() => {
    void bootstrap();
    return () => clearTimeout(hintTimer.current);
  }, []);
  useEffect(() => {
    const onPopState = () => {
      ++navigationRequest.current;
      returningHome.current = false;
      const params = new URLSearchParams(window.location.search);
      setRouteGameId(params.get("game"));
      const nextMode = params.get("mode");
      setMode(
        nextMode === "hidden" || nextMode === "differences" ? nextMode : null,
      );
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  useEffect(() => {
    if (!catalog) return;
    const request = ++navigationRequest.current;
    clearTimeout(hintTimer.current);
    setHint(null);
    setConfirmRestart(false);
    setCompletionDismissed(false);
    setHelpOpen(false);
    setSettings(false);
    setConfirmReset(false);
    setActive(null);
    current.current = null;
    setLoading(null);
    if (routeGameId) {
      const game = catalog.games.find((g) => g.id === routeGameId);
      if (game) void loadGame(game, request);
      else {
        const url = new URL(window.location.href);
        url.searchParams.delete("game");
        url.searchParams.set("mode", mode || "differences");
        setMode(mode || "differences");
        window.history.replaceState(null, "", url);
        setRouteGameId(null);
        setNotice("찾는 게임이 없어요. 다른 게임을 골라주세요.");
      }
    } else {
      void updateReady();
      void checkForUpdate();
    }
    return () => {
      ++navigationRequest.current;
    };
  }, [catalog, routeGameId]);
  useEffect(() => {
    const refresh = () => {
      if (!active) {
        void updateReady();
        void checkForUpdate();
      }
    };
    window.addEventListener("online", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("online", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [catalog, active]);
  useEffect(() => {
    if (!settings && !confirmRestart && !completionOpen) return;
    const previous = document.activeElement as HTMLElement | null,
      dialog = document.querySelector<HTMLElement>("[role=dialog]");
    if (!dialog) return;
    const buttons = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled),[href],input,[tabindex="0"]',
        ),
      );
    buttons()[0]?.focus();
    const keys = (event: KeyboardEvent) => {
      if (event.key === "Escape" && confirmRestart) setConfirmRestart(false);
      if (event.key === "Escape" && completionOpen)
        setCompletionDismissed(true);
      if (event.key === "Escape" && settings && !settingsBusyRef.current) {
        setSettings(false);
        setConfirmReset(false);
      }
      if (event.key === "Tab") {
        const items = buttons(),
          first = items[0],
          last = items.at(-1);
        if (!first) {
          event.preventDefault();
          dialog.focus();
          return;
        }
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", keys);
    return () => {
      document.removeEventListener("keydown", keys);
      if (previous?.isConnected && previous !== document.body) previous.focus();
      else document.querySelector<SVGSVGElement>("svg.board")?.focus();
    };
  }, [settings, confirmRestart, completionOpen]);
  async function checkForUpdate() {
    if (!navigator.onLine || !("serviceWorker" in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration?.update();
    } catch {
      /* Keep the current usable version. */
    }
  }
  async function updateReady() {
    if (catalog)
      setReady(
        Object.fromEntries(
          await Promise.all(
            catalog.games.map(
              async (g) => [g.id, await isOfflineReady(g)] as const,
            ),
          ),
        ),
      );
  }
  async function persist(p: Progress) {
    pending.current = pending.current
      .catch(() => {})
      .then(() => saveProgress(p));
    try {
      await pending.current;
    } catch {
      setNotice(
        "진행 기록을 저장하지 못했어요. 앱을 닫으면 기록이 사라질 수 있어요.",
      );
      throw new Error("save");
    }
  }
  function playSound(kind: "correct" | "complete" | "wrong" = "correct") {
    if (!sound) return;
    try {
      audio.current ||= new AudioContext();
      const ctx = audio.current;
      void ctx.resume();
      const complete = kind === "complete";
      const notes =
        kind === "wrong"
          ? [220, 261.63].map((frequency, i) => ({
              frequency,
              delay: i * 0.075,
              duration: 0.14,
            }))
          : complete
            ? [523, 659, 784].map((frequency, i) => ({
                frequency,
                delay: i * 0.12,
                duration: 0.16,
              }))
            : [784, 587.33].map((frequency, i) => ({
                frequency,
                delay: i * 0.24,
                duration: 0.55,
              }));
      function tone(
        frequency: number,
        t: number,
        duration: number,
        volume: number,
      ) {
        const osc = ctx.createOscillator(),
          gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(
          volume,
          t + (kind === "wrong" ? 0.018 : 0.008),
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + duration + 0.02);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      }
      notes.forEach(({ frequency, delay, duration }) => {
        const t = ctx.currentTime + delay;
        tone(
          frequency,
          t,
          duration,
          kind === "wrong" ? 0.028 : complete ? 0.08 : 0.065,
        );
        if (kind === "correct") tone(frequency * 2.76, t, 0.2, 0.01);
      });
    } catch {
      /* Visible feedback is always available. */
    }
  }
  function chooseMode(next: GameKind | null) {
    const url = new URL(window.location.href);
    url.searchParams.delete("game");
    if (next) url.searchParams.set("mode", next);
    else url.searchParams.delete("mode");
    window.history.pushState(null, "", url);
    ++navigationRequest.current;
    setRouteGameId(null);
    setMode(next);
    setTheme("전체");
    setDifficulty("all");
    setNotice("");
  }
  function openGame(game: Game) {
    if (routeGameId === game.id) {
      void loadGame(game, ++navigationRequest.current);
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("game", game.id);
    url.searchParams.set("mode", gameKind(game));
    window.history.pushState({ kkokkokFromHome: !routeGameId }, "", url);
    ++navigationRequest.current;
    setRouteGameId(game.id);
  }
  async function loadGame(game: Game, request: number) {
    setLoading(game.id);
    setNotice("");
    try {
      const response = await fetch(game.puzzleUrl);
      if (!response.ok) throw new Error();
      const puzzle: Puzzle = await response.json();
      if (
        puzzle.id !== game.id ||
        (puzzle.kind || "differences") !== gameKind(game) ||
        puzzleAnswers(puzzle).length !== countByLevel[game.difficulty]
      )
        throw new Error();
      if (request !== navigationRequest.current) return;
      // Preload every board and target image before making the game interactive.
      await Promise.all(
        [
          game.original,
          ...(game.modified ? [game.modified] : []),
          ...(puzzle.kind === "hidden"
            ? puzzle.targets.map((t) => targetImageUrl(game, t))
            : []),
        ].map(
          (src) =>
            new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve();
              img.onerror = () => reject(new Error());
              img.src = src;
            }),
        ),
      );
      if (request !== navigationRequest.current) return;
      const p = currentProgress(game, progress[game.id]);
      current.current = p;
      setProgress((prev) => ({ ...prev, [game.id]: p }));
      setActive({ game, puzzle });
      setResetKey((k) => k + 1);
      setHint(null);
      try {
        setHelpOpen(localStorage.getItem("kkokkok-play-help-seen") !== "true");
      } catch {
        setHelpOpen(true);
      }
      if (window.isSecureContext && "caches" in window) {
        try {
          await cacheGame(game);
          setReady((r) => ({ ...r, [game.id]: true }));
        } catch {
          setReady((r) => ({ ...r, [game.id]: false }));
          if (request !== navigationRequest.current) return;
          setNotice(
            "오프라인 저장을 마치지 못했어요. 지금은 인터넷에 연결해서 플레이할 수 있어요.",
          );
        }
      }
    } catch {
      if (request !== navigationRequest.current) return;
      setNotice(
        navigator.onLine
          ? "게임을 불러오지 못했어요. 인터넷 연결을 확인하고 다시 눌러주세요."
          : "이 게임을 열려면 인터넷 연결이 필요해요.",
      );
    } finally {
      if (request === navigationRequest.current) setLoading(null);
    }
  }
  function correct(id: string) {
    if (
      !active ||
      !current.current ||
      current.current.found.includes(id) ||
      current.current.completed
    )
      return;
    const found = [...current.current.found, id],
      p = {
        ...current.current,
        found,
        completed: found.length === puzzleAnswers(active.puzzle).length,
        updatedAt: new Date().toISOString(),
      };
    current.current = p;
    setProgress((prev) => ({ ...prev, [p.id]: p }));
    setHint(null);
    playSound(p.completed ? "complete" : "correct");
    void persist(p).catch(() => {});
  }
  async function goHome() {
    if (!routeGameId || returningHome.current) return;
    returningHome.current = true;
    const request = navigationRequest.current;
    try {
      await pending.current;
    } catch {
      /* Keep the failure notice. */
    }
    if (request !== navigationRequest.current) {
      returningHome.current = false;
      return;
    }
    ++navigationRequest.current;
    if (window.history.state?.kkokkokFromHome) window.history.back();
    else {
      const url = new URL(window.location.href);
      url.searchParams.delete("game");
      const kind = active
        ? gameKind(active.game)
        : selectedKind || "differences";
      url.searchParams.set("mode", kind);
      setMode(kind);
      window.history.replaceState(null, "", url);
      setRouteGameId(null);
      returningHome.current = false;
    }
  }
  async function restart() {
    if (!active) return;
    const p = { ...currentProgress(active.game), found: [], completed: false };
    current.current = p;
    setProgress((prev) => ({ ...prev, [p.id]: p }));
    clearTimeout(hintTimer.current);
    setHint(null);
    setConfirmRestart(false);
    setResetKey((k) => k + 1);
    setCompletionDismissed(false);
    await persist(p).catch(() => {});
  }
  function showHint() {
    if (!active || !current.current) return;
    const choices = puzzleAnswers(active.puzzle).filter(
      (d) => !current.current!.found.includes(d.id),
    );
    if (!choices.length) return;
    const next = choices[Math.floor(Math.random() * choices.length)];
    setHint(next.id);
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(null), 2000);
  }
  function closeHelp() {
    setHelpOpen(false);
    try {
      localStorage.setItem("kkokkok-play-help-seen", "true");
    } catch {
      // Preference storage is optional; the guide remains available.
    }
  }
  async function changeSound(inSettings = false) {
    if (settingsBusy) return;
    const next = !sound;
    setSound(next);
    if (inSettings) {
      setSettingsBusy("sound");
      setSettingMessages((messages) => ({
        ...messages,
        sound: "소리 설정을 저장하고 있어요…",
      }));
    }
    try {
      await setSoundSetting(next);
      if (inSettings)
        setSettingMessages((messages) => ({
          ...messages,
          sound: next ? "효과음을 켰어요." : "효과음을 껐어요.",
        }));
    } catch {
      const message =
        "소리 설정을 저장하지 못했어요. 다음 실행 때는 이전 설정으로 돌아갈 수 있어요.";
      if (inSettings)
        setSettingMessages((messages) => ({ ...messages, sound: message }));
      else setNotice(message);
    } finally {
      if (inSettings) setSettingsBusy(null);
    }
  }
  async function removeOfflineFiles() {
    if (settingsBusy) return;
    setSettingsBusy("offline");
    setSettingMessages((messages) => ({
      ...messages,
      offline: "게임 파일을 삭제하고 있어요…",
    }));
    try {
      await deleteOfflineFiles();
      setReady({});
      setSettingMessages((messages) => ({
        ...messages,
        offline: "오프라인 게임 파일을 삭제했어요. 진행 기록은 그대로예요.",
      }));
    } catch {
      setSettingMessages((messages) => ({
        ...messages,
        offline: "파일을 삭제하지 못했어요. 다시 시도해주세요.",
      }));
    } finally {
      setSettingsBusy(null);
    }
  }
  async function resetProgress() {
    if (settingsBusy) return;
    setSettingsBusy("reset");
    setSettingMessages((messages) => ({
      ...messages,
      reset: "진행 기록을 초기화하고 있어요…",
    }));
    try {
      await pending.current;
      await clearProgress();
      setProgress({});
      setConfirmReset(false);
      setSettingMessages((messages) => ({
        ...messages,
        reset: "진행 기록을 초기화했어요. 소리 설정과 게임 파일은 그대로예요.",
      }));
    } catch {
      setSettingMessages((messages) => ({
        ...messages,
        reset: "기록을 초기화하지 못했어요. 다시 시도해주세요.",
      }));
    } finally {
      setSettingsBusy(null);
      requestAnimationFrame(() => resetTrigger.current?.focus());
    }
  }
  async function update() {
    if (active) return;
    try {
      await pending.current;
      if (!navigator.onLine) throw new Error();
      await updateServiceWorker(true);
    } catch {
      setNotice(
        "업데이트를 마치지 못했어요. 연결과 저장 상태를 확인하고 다시 시도해주세요.",
      );
    }
  }
  const games = (catalog?.games || []).filter(
      (g) => gameKind(g) === selectedKind,
    ),
    filtered = games.filter(
      (g) =>
        (theme === "전체" || g.theme === theme) &&
        (difficulty === "all" || g.difficulty === difficulty),
    ),
    p = active ? progress[active.game.id] : undefined;
  return (
    <main
      className={
        active
          ? `app playing ${active.puzzle.kind === "hidden" ? "playing-hidden" : ""}`
          : "app"
      }
    >
      {!active && (
        <header className="app-header">
          <button
            className="brand"
            onClick={() => chooseMode(null)}
            aria-label="그림콕콕 홈"
          >
            <span className="brand-mark">
              <Icon name="search" />
            </span>
            <span>
              그림<span className="brand-accent">콕콕</span>
            </span>
          </button>
          <div className="header-actions">
            <button
              className="icon-button"
              onClick={() => void changeSound()}
              aria-label={sound ? "소리 끄기" : "소리 켜기"}
              aria-pressed={sound}
            >
              <Icon name={sound ? "sound" : "mute"} />
            </button>
            {!active && (
              <button
                className="icon-button"
                onClick={() => {
                  setSettingMessages({});
                  setSettings(true);
                }}
                aria-label="설정"
              >
                <Icon name="settings" />
              </button>
            )}
          </div>
        </header>
      )}
      {notice && !settings && (
        <div className="notice" role="status">
          {notice}
          <button onClick={() => setNotice("")} aria-label="안내 닫기">
            닫기
          </button>
        </div>
      )}
      {!active ? (
        <>
          {!selectedKind && !routeGameId ? (
            <>
              <ModeSelection
                games={catalog?.games || []}
                onChoose={chooseMode}
              />
              {error && (
                <div className="empty">
                  <p>{error}</p>
                  <button className="primary" onClick={() => void bootstrap()}>
                    다시 불러오기
                  </button>
                </div>
              )}
              {needRefresh && (
                <div className="update-banner" role="status">
                  <span>새로운 그림콕콕이 준비됐어요.</span>
                  <button onClick={() => void update()}>업데이트</button>
                </div>
              )}
            </>
          ) : (
            <>
              <button
                className="back-button library-back"
                onClick={() => chooseMode(null)}
              >
                <Icon name="back" />
                놀이 선택
              </button>
              <section className="welcome">
                <div>
                  <h1>
                    {selectedKind === "hidden" ? (
                      <>
                        숨은<span>그림찾기</span>
                      </>
                    ) : (
                      <>
                        틀린<span>그림찾기</span>
                      </>
                    )}
                  </h1>
                  <p>
                    {selectedKind === "hidden"
                      ? "그림 속에 꼭꼭 숨은 물건을 찾아봐요."
                      : "천천히 살펴봐요. 다른 곳을 콕!"}
                  </p>
                </div>
                <div className="welcome-drawing" aria-hidden="true">
                  <Icon name="search" />
                  <span className="spark one" />
                  <span className="spark two" />
                  <span className="spark three" />
                </div>
              </section>
              {needRefresh && (
                <div className="update-banner" role="status">
                  <span>새로운 그림콕콕이 준비됐어요.</span>
                  <button onClick={() => void update()}>업데이트</button>
                </div>
              )}
              <nav className="themes" aria-label="주제 필터">
                {["전체", "동물", "우주", "공주", "동화", "교통", "일상"].map(
                  (t) => (
                    <button
                      key={t}
                      aria-pressed={theme === t}
                      onClick={() => setTheme(t)}
                    >
                      {t}
                    </button>
                  ),
                )}
              </nav>
              <section
                className={`library ${selectedKind === "hidden" ? "hidden-library" : ""}`}
              >
                <div className="library-header">
                  <h2>
                    그림을 골라봐요 <span>{filtered.length}</span>
                  </h2>
                  <div className="levels" aria-label="난이도 필터">
                    {(["all", "easy", "medium", "hard"] as const).map((l) => (
                      <button
                        key={l}
                        aria-pressed={difficulty === l}
                        onClick={() => setDifficulty(l)}
                      >
                        {l === "all" ? "모두" : levelNames[l]}
                      </button>
                    ))}
                  </div>
                </div>
                {error ? (
                  <div className="empty">
                    <h3>잠깐, 연결을 확인해요</h3>
                    <p>{error}</p>
                    <button
                      className="primary"
                      onClick={() => void bootstrap()}
                    >
                      다시 불러오기
                    </button>
                  </div>
                ) : !catalog ? (
                  <div className="empty" role="status">
                    그림을 준비하고 있어요…
                  </div>
                ) : !filtered.length ? (
                  <div className="empty">
                    <Icon name="search" />
                    <h3>
                      {games.length
                        ? "다른 그림을 골라볼까요?"
                        : "그림을 준비하고 있어요"}
                    </h3>
                    <p>
                      {games.length
                        ? "주제나 난이도를 바꾸면 다른 게임을 볼 수 있어요."
                        : "새로운 그림이 준비되면 이곳에서 만나요."}
                    </p>
                    {games.length > 0 && (
                      <button
                        className="primary"
                        onClick={() => {
                          setTheme("전체");
                          setDifficulty("all");
                        }}
                      >
                        모든 그림 보기
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    className={`game-grid ${selectedKind === "hidden" ? "hidden-game-grid" : ""} ${selectedKind === "hidden" && filtered.length === 1 ? "one-hidden-game" : ""}`}
                  >
                    {filtered.map((g) => {
                      const saved = currentProgress(g, progress[g.id]);
                      return (
                        <button
                          className="game-card"
                          key={g.id}
                          onClick={() => void openGame(g)}
                          disabled={!!loading}
                        >
                          <div className="thumbnail">
                            <img
                              src={g.thumbnail}
                              alt={g.title}
                              loading="lazy"
                            />
                            <span className={`difficulty ${g.difficulty}`}>
                              {levelNames[g.difficulty]} ·{" "}
                              {countByLevel[g.difficulty]}개
                            </span>
                            {saved.completed && (
                              <span className="completed-stamp">
                                <Icon name="check" />
                                완료
                              </span>
                            )}
                          </div>
                          <div className="card-body">
                            <h3>{g.title}</h3>
                            <div className="card-meta">
                              {g.theme}
                              {ready[g.id] && <span>오프라인 가능</span>}
                            </div>
                            {g.kind === "hidden" && (
                              <div className="card-targets" aria-hidden="true">
                                {g.targetImages?.slice(0, 7).map((src) => (
                                  <img
                                    key={src}
                                    src={src}
                                    alt=""
                                    loading="lazy"
                                  />
                                ))}
                              </div>
                            )}
                            <div className="card-bottom">
                              <span>
                                {loading === g.id
                                  ? "그림을 여는 중…"
                                  : saved.completed
                                    ? "완료"
                                    : saved.found.length
                                      ? `푸는 중 · ${saved.found.length}/${countByLevel[g.difficulty]}`
                                      : "새 게임"}
                              </span>
                              <span className="card-action">
                                {saved.completed
                                  ? "다시 만나기"
                                  : saved.found.length
                                    ? "이어서 풀기"
                                    : "시작하기"}{" "}
                                <Icon name="arrow" />
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
              <footer>내 속도로, 하나씩 콕콕.</footer>
            </>
          )}
        </>
      ) : (
        <>
          <div className="play-heading">
            <button className="back-button" onClick={() => void goHome()}>
              <Icon name="back" />
              {active.puzzle.kind === "hidden" ? "다른 그림" : "다른 게임"}
            </button>
            <h1 title={active.game.title}>{active.game.title}</h1>
            <div
              className="play-progress"
              role="status"
              aria-label={`${p?.found.length || 0}개 찾음, 전체 ${puzzleAnswers(active.puzzle).length}개`}
            >
              <span className="progress-count">
                {p?.found.length || 0} / {puzzleAnswers(active.puzzle).length}개
              </span>
              <div className="progress-bubbles" aria-hidden="true">
                {puzzleAnswers(active.puzzle).map((d, i) => (
                  <span
                    key={d.id}
                    className={p?.found.includes(d.id) ? "found" : ""}
                  >
                    {p?.found.includes(d.id) ? <Icon name="check" /> : i + 1}
                  </span>
                ))}
              </div>
            </div>
            <div className="play-actions">
              <button
                onClick={(event) => {
                  if (current.current?.found.length) {
                    event.currentTarget.focus();
                    setConfirmRestart(true);
                  } else void restart();
                }}
              >
                다시 풀기
              </button>
              <button
                className="hint-button"
                onClick={showHint}
                disabled={p?.completed}
              >
                <Icon name="hint" />
                힌트
              </button>
              <button
                className="icon-button"
                onClick={() => void changeSound()}
                aria-label={sound ? "소리 끄기" : "소리 켜기"}
                aria-pressed={sound}
              >
                <Icon name={sound ? "sound" : "mute"} />
              </button>
              <button
                className="icon-button"
                aria-label="놀이 도움말"
                aria-expanded={helpOpen}
                aria-controls="play-help"
                onClick={() => (helpOpen ? closeHelp() : setHelpOpen(true))}
              >
                <Icon name="help" />
              </button>
            </div>
          </div>
          {helpOpen && (
            <aside className="play-help" id="play-help" aria-label="놀이 방법">
              <p>
                {active.puzzle.kind === "hidden"
                  ? "찾을 물건을 그림 속에서 찾아 콕! 두 손가락으로 확대하고 움직여요."
                  : "어느 그림이든 다른 곳을 콕! 두 손가락으로 확대하고 움직여요."}
              </p>
              <button onClick={closeHelp} aria-label="놀이 안내 닫기">
                알겠어요
              </button>
            </aside>
          )}
          <div
            className={
              active.puzzle.kind === "hidden"
                ? "hidden-play-layout"
                : "comparison-play-layout"
            }
          >
            <Board
              game={active.game}
              puzzle={active.puzzle}
              found={p?.found || []}
              hint={hint}
              onCorrect={correct}
              onWrong={() => {
                if (!current.current?.completed) playSound("wrong");
              }}
              resetKey={resetKey}
            />
            {active.puzzle.kind === "hidden" && (
              <HiddenTargets
                game={active.game}
                puzzle={active.puzzle}
                found={p?.found || []}
                hint={hint}
              />
            )}
          </div>
          {confirmRestart && (
            <div className="modal-backdrop">
              <section
                className="settings"
                role="dialog"
                aria-modal="true"
                aria-labelledby="restart-title"
              >
                <h2 id="restart-title">처음부터 다시 풀까요?</h2>
                <p>이 게임에서 찾은 정답만 지워져요.</p>
                <div className="restart-actions">
                  <button
                    className="secondary"
                    onClick={() => setConfirmRestart(false)}
                  >
                    계속 풀기
                  </button>
                  <button className="primary" onClick={() => void restart()}>
                    다시 풀기
                  </button>
                </div>
              </section>
            </div>
          )}
          {completionOpen && (
            <div className="completion-layer">
              <section
                className="completion"
                role="dialog"
                aria-modal="true"
                aria-labelledby="complete-title"
              >
                <div className="completion-symbol">
                  <Icon name="check" />
                </div>
                <h2 id="complete-title">모두 찾았어요!</h2>
                <p>
                  꼼꼼하게 살펴봤네요.
                  <br />
                  다른 그림도 만나볼까요?
                </p>
                <button
                  className="primary"
                  onClick={() => setCompletionDismissed(true)}
                >
                  그림 더 보기
                </button>
                <button className="secondary" onClick={() => void goHome()}>
                  다른 게임 고르기
                </button>
                <button
                  className="secondary"
                  onClick={() => {
                    setCompletionDismissed(true);
                    setConfirmRestart(true);
                  }}
                >
                  다시 풀기
                </button>
              </section>
            </div>
          )}
        </>
      )}
      {settings && (
        <div className="modal-backdrop">
          <section
            className="settings"
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby="settings-title"
          >
            <div className="settings-header">
              <h2 id="settings-title">설정</h2>
              <button
                disabled={!!settingsBusy}
                onClick={() => {
                  setSettings(false);
                  setConfirmReset(false);
                }}
              >
                닫기
              </button>
            </div>
            {notice && (
              <p className="setting-feedback" role="status">
                {notice}
              </p>
            )}
            <button
              className="setting-row"
              aria-pressed={sound}
              aria-describedby={
                settingMessages.sound ? "sound-feedback" : undefined
              }
              disabled={!!settingsBusy}
              onClick={() => void changeSound(true)}
            >
              <span>효과음</span>
              <strong>{sound ? "켜짐" : "꺼짐"}</strong>
            </button>
            {settingMessages.sound && (
              <p className="setting-feedback" id="sound-feedback" role="status">
                {settingMessages.sound}
              </p>
            )}
            <div
              className="setting-block"
              aria-busy={settingsBusy === "offline"}
            >
              <h3>오프라인 게임 파일 삭제</h3>
              <p>
                진행 기록과 소리 설정은 그대로 남아요.
                <br />
                다음에 게임을 열면 다시 저장해요.
              </p>
              <button
                className="secondary"
                disabled={!!settingsBusy}
                onClick={() => void removeOfflineFiles()}
              >
                {settingsBusy === "offline" ? "삭제 중…" : "게임 파일 삭제"}
              </button>
              {settingMessages.offline && (
                <p className="setting-feedback" role="status">
                  {settingMessages.offline}
                </p>
              )}
            </div>
            <div className="setting-block" aria-busy={settingsBusy === "reset"}>
              <h3>전체 진행 기록 초기화</h3>
              <p>두 놀이에서 찾은 정답과 완료 기록을 처음으로 되돌려요.</p>
              {confirmReset ? (
                <div className="reset-confirm">
                  <p>
                    틀린그림찾기와 숨은그림찾기의 모든 진행 기록을 지울까요?
                  </p>
                  <button
                    className="danger"
                    disabled={!!settingsBusy}
                    onClick={() => void resetProgress()}
                  >
                    {settingsBusy === "reset" ? "초기화 중…" : "기록 초기화"}
                  </button>
                  <button
                    disabled={!!settingsBusy}
                    onClick={() => {
                      setConfirmReset(false);
                      requestAnimationFrame(() =>
                        resetTrigger.current?.focus(),
                      );
                    }}
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  className="secondary"
                  ref={resetTrigger}
                  disabled={!!settingsBusy}
                  onClick={() => setConfirmReset(true)}
                >
                  진행 기록 초기화
                </button>
              )}
              {settingMessages.reset && (
                <p className="setting-feedback" role="status">
                  {settingMessages.reset}
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

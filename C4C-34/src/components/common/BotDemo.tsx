/**
 * BotDemo — autoplay phone-frame WhatsApp simulator for the home page.
 *
 * Strictly Mode A (watch-only). Bubbles fade/slide in one by one with realistic
 * typing indicators between bot messages. Plays once on first viewport entry,
 * loops with a soft pause after the success bubble. User can pause/replay.
 *
 * Honors `prefers-reduced-motion`: skips the slide animation and shortens
 * typing pauses to ~150ms, so the whole transcript still plays in ~5s without
 * motion that could trigger vestibular issues.
 *
 * No backend required — runs the static `DEMO_TRANSCRIPT`. We don't ping
 * `/wabot/demo/run` because it currently returns engine output that doesn't
 * match the curated copy here, and the demo must always look the same.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, CheckCircle2, Mic, Play, Pause, RotateCcw, ShieldCheck } from "lucide-react";
import { DEMO_TRANSCRIPT, type DemoBubble } from "@/data/botDemoScript";
import { useLang } from "@/lib/i18n";

/** What the user sees in the chat area. Either a real script bubble or a typing indicator. */
type RenderItem = { kind: "bubble"; bubble: DemoBubble } | { kind: "typing"; id: string };

/** Pacing knobs — tuned by hand. */
const TYPING_MS_BOT = 950; // how long the "…" indicator shows before a bot bubble
const TYPING_MS_USER = 450; // user "typing" is much shorter — feels like sending
const BETWEEN_MS_DEFAULT = 900; // pause AFTER a bubble before next typing starts
const LOOP_PAUSE_MS = 4500; // pause on the success bubble before looping

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Renders the green WhatsApp-style bubbles for *bold*, line breaks, and bullets
 * the same way the production engine emits them. We accept *star-bold* and
 * \\n line breaks. No raw HTML is injected — we walk the string by char.
 */
function FormattedText({ text }: { text: string }) {
  const parts = useMemo(() => {
    const out: { kind: "text" | "bold"; value: string }[] = [];
    let buf = "";
    let bold = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === "*") {
        if (buf) {
          out.push({ kind: bold ? "bold" : "text", value: buf });
          buf = "";
        }
        bold = !bold;
        continue;
      }
      buf += ch;
    }
    if (buf) out.push({ kind: bold ? "bold" : "text", value: buf });
    return out;
  }, [text]);

  return (
    <span className="whitespace-pre-line">
      {parts.map((p, i) =>
        p.kind === "bold" ? (
          <strong key={i} className="font-semibold">
            {p.value}
          </strong>
        ) : (
          <span key={i}>{p.value}</span>
        ),
      )}
    </span>
  );
}

function TypingIndicator({ author }: { author: "user" | "bot" }) {
  const isBot = author === "bot";
  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"} px-3`}>
      <div
        className={`flex items-center gap-1 rounded-2xl px-3.5 py-2.5 shadow-sm ${
          isBot
            ? "rounded-bl-md bg-white text-foreground"
            : "rounded-br-md bg-[#dcf8c6] text-[#1f2937]"
        }`}
        aria-label={isBot ? "Bot is typing" : "User is typing"}
      >
        <span className="block h-1.5 w-1.5 animate-[botdemoBounce_1.2s_ease-in-out_infinite] rounded-full bg-foreground/40" />
        <span
          className="block h-1.5 w-1.5 animate-[botdemoBounce_1.2s_ease-in-out_infinite] rounded-full bg-foreground/40"
          style={{ animationDelay: "0.15s" }}
        />
        <span
          className="block h-1.5 w-1.5 animate-[botdemoBounce_1.2s_ease-in-out_infinite] rounded-full bg-foreground/40"
          style={{ animationDelay: "0.3s" }}
        />
      </div>
    </div>
  );
}

function Bubble({ bubble, reduce }: { bubble: DemoBubble; reduce: boolean }) {
  const isBot = bubble.author === "bot";
  const wrapper = `flex ${isBot ? "justify-start" : "justify-end"} px-3`;
  const animClass = reduce
    ? ""
    : isBot
      ? "animate-[botdemoSlideInLeft_280ms_ease-out_both]"
      : "animate-[botdemoSlideInRight_280ms_ease-out_both]";

  if (bubble.kind === "image") {
    return (
      <div className={wrapper}>
        <div
          className={`max-w-[78%] overflow-hidden rounded-2xl rounded-br-md bg-[#dcf8c6] p-1.5 shadow-sm ${animClass}`}
        >
          <img
            src={bubble.imageUrl}
            alt={bubble.caption ?? "Product photo"}
            className="aspect-square w-full rounded-xl object-cover"
            loading="lazy"
          />
          {bubble.caption ? (
            <p className="px-2 pt-1.5 pb-1 text-[13px] leading-snug text-[#1f2937]">
              {bubble.caption}
            </p>
          ) : null}
          <div className="flex items-center justify-end gap-1 px-2 pb-0.5">
            <span className="text-[10px] text-[#1f2937]/60">12:14</span>
            <SeenTicks />
          </div>
        </div>
      </div>
    );
  }

  if (bubble.kind === "card") {
    return (
      <div className={wrapper}>
        <div
          className={`max-w-[88%] overflow-hidden rounded-2xl rounded-bl-md bg-white shadow-sm ${animClass}`}
        >
          <div className="border-l-4 border-primary bg-soft-highlight/40 px-3.5 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">
              AI-drafted listing
            </p>
            <p className="mt-1 font-display text-[17px] leading-snug text-foreground">
              {bubble.title}
            </p>
            <p className="mt-0.5 font-display text-xl font-semibold text-primary">{bubble.price}</p>
          </div>
          <div className="space-y-1.5 px-3.5 py-3 text-[13px] leading-relaxed text-foreground/80">
            {bubble.lines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <div className="flex items-center justify-end gap-1 px-3 pb-1.5">
            <span className="text-[10px] text-foreground/40">12:15</span>
          </div>
        </div>
      </div>
    );
  }

  if (bubble.kind === "success") {
    return (
      <div className={wrapper}>
        <div
          className={`flex max-w-[88%] items-start gap-2.5 rounded-2xl rounded-bl-md border border-artisan-green/20 bg-artisan-green/10 px-3.5 py-3 shadow-sm ${animClass}`}
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-artisan-green" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-artisan-green">{bubble.title}</p>
            <p className="mt-0.5 text-[13px] leading-snug text-foreground/70">{bubble.subtitle}</p>
          </div>
        </div>
      </div>
    );
  }

  // Text bubble
  return (
    <div className={wrapper}>
      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2 shadow-sm ${
          isBot
            ? "rounded-bl-md bg-white text-foreground"
            : "rounded-br-md bg-[#dcf8c6] text-[#1f2937]"
        } ${animClass}`}
      >
        <p className="text-[14px] leading-relaxed">
          <FormattedText text={bubble.text} />
        </p>
        <div className="-mb-1 flex items-center justify-end gap-1 pt-0.5">
          <span className={`text-[10px] ${isBot ? "text-foreground/40" : "text-[#1f2937]/55"}`}>
            12:14
          </span>
          {!isBot ? <SeenTicks /> : null}
        </div>
      </div>
    </div>
  );
}

function SeenTicks() {
  return (
    <svg
      width="14"
      height="10"
      viewBox="0 0 16 11"
      className="text-[#34b7f1]"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M11.071.653a.5.5 0 0 1 .073.707L4.93 8.5l-.054.06a.5.5 0 0 1-.708-.034L1.354 5.207a.5.5 0 0 1 .708-.708l2.43 2.43L10.364.726a.5.5 0 0 1 .707-.073Zm4 0a.5.5 0 0 1 .073.707L8.93 8.5l-.055.06a.5.5 0 0 1-.708-.034l-1.5-1.5a.5.5 0 1 1 .708-.708l1.114 1.115L14.364.726a.5.5 0 0 1 .707-.073Z" />
    </svg>
  );
}

/* ----------------------------- main component ----------------------------- */

export function BotDemo() {
  const { t } = useLang();
  const [items, setItems] = useState<RenderItem[]>([]);
  const [paused, setPaused] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [reduce, setReduce] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const runIdRef = useRef(0); // bumped on every replay so stale timers self-cancel

  // Reduced motion preference, set once at mount + listen for changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduce(prefersReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // Auto-scroll the chat to the bottom as new bubbles arrive.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [items, reduce]);

  // Keep a ref of paused so the running scheduler sees the latest value
  // without re-creating itself.
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  /** Schedules the entire transcript. Self-cancels if the run id changes. */
  const play = useCallback(
    (fromIndex = 0) => {
      const myRunId = ++runIdRef.current;
      indexRef.current = fromIndex;

      // Clear any in-flight timer.
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const tick = () => {
        if (myRunId !== runIdRef.current) return; // superseded by replay/unmount
        if (pausedRef.current) {
          // Re-check shortly; a paused state should hold position, not advance.
          timeoutRef.current = setTimeout(tick, 200);
          return;
        }

        const idx = indexRef.current;
        if (idx >= DEMO_TRANSCRIPT.length) {
          // Loop after a comfortable pause on the success bubble.
          timeoutRef.current = setTimeout(() => {
            if (myRunId !== runIdRef.current) return;
            setItems([]);
            indexRef.current = 0;
            tick();
          }, LOOP_PAUSE_MS);
          return;
        }

        const bubble = DEMO_TRANSCRIPT[idx];
        const typingMs = reduce ? 80 : bubble.author === "bot" ? TYPING_MS_BOT : TYPING_MS_USER;

        // Show typing indicator first…
        setItems((prev) => [...prev, { kind: "typing", id: `typing-${idx}-${myRunId}` }]);

        timeoutRef.current = setTimeout(() => {
          if (myRunId !== runIdRef.current) return;
          if (pausedRef.current) {
            timeoutRef.current = setTimeout(tick, 200);
            return;
          }
          // …replace it with the actual bubble.
          setItems((prev) => {
            const next = prev.slice(0, -1);
            next.push({ kind: "bubble", bubble });
            return next;
          });

          indexRef.current = idx + 1;
          const between = reduce ? 120 : (bubble.delay ?? BETWEEN_MS_DEFAULT);
          timeoutRef.current = setTimeout(tick, between);
        }, typingMs);
      };

      tick();
    },
    [reduce],
  );

  // Start playback on first viewport entry.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasPlayed) {
            setHasPlayed(true);
            play(0);
          }
        }
      },
      { rootMargin: "-10% 0px -10% 0px", threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasPlayed, play]);

  // Cleanup on unmount. The ref-mutation here is intentional: bumping
  // runIdRef invalidates any in-flight scheduler closures so they bail out
  // before touching state on an unmounted component.
  useEffect(() => {
    const timeoutRefCurrent = timeoutRef;
    const runIdRefCurrent = runIdRef;
    return () => {
      runIdRefCurrent.current++;
      if (timeoutRefCurrent.current) clearTimeout(timeoutRefCurrent.current);
    };
  }, []);

  const onReplay = useCallback(() => {
    setItems([]);
    setPaused(false);
    play(0);
  }, [play]);

  const onTogglePause = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  return (
    <div
      ref={sectionRef}
      className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,0.95fr)] lg:gap-16"
    >
      {/* Left column — copy + value props */}
      <div className="lg:max-w-md">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
          <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-artisan-green" />
          {t("home.demoEyebrow")}
        </div>
        <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl">
          {t("home.demoTitle")}
          <span className="block text-primary">{t("home.demoTitleAccent")}</span>
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">{t("home.demoDesc")}</p>

        <ul className="mt-7 space-y-3.5 text-sm">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Mic className="h-3.5 w-3.5" />
            </span>
            <span>
              <strong className="font-semibold">{t("home.demoFeature1Title")}</strong>
              <span className="text-muted-foreground"> — {t("home.demoFeature1Body")}</span>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Camera className="h-3.5 w-3.5" />
            </span>
            <span>
              <strong className="font-semibold">{t("home.demoFeature2Title")}</strong>
              <span className="text-muted-foreground"> — {t("home.demoFeature2Body")}</span>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            <span>
              <strong className="font-semibold">{t("home.demoFeature3Title")}</strong>
              <span className="text-muted-foreground"> — {t("home.demoFeature3Body")}</span>
            </span>
          </li>
        </ul>

        <div className="mt-7 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onTogglePause}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-soft-highlight"
            aria-label={paused ? t("home.demoPlay") : t("home.demoPause")}
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {paused ? t("home.demoPlay") : t("home.demoPause")}
          </button>
          <button
            type="button"
            onClick={onReplay}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-soft-highlight"
            aria-label={t("home.demoReplay")}
          >
            <RotateCcw className="h-4 w-4" />
            {t("home.demoReplay")}
          </button>
          <span className="ml-1 text-xs text-muted-foreground">{t("home.demoMeta")}</span>
        </div>
      </div>

      {/* Vertical divider — desktop only, decorative */}
      <div className="hidden h-[420px] w-px bg-gradient-to-b from-transparent via-border to-transparent lg:block" />

      {/* Right column — phone */}
      <div className="relative mx-auto w-full max-w-[360px]">
        {/* Decorative blob behind the phone */}
        <div
          className="absolute inset-0 -z-10 -translate-x-6 translate-y-8 rounded-[3rem] bg-gradient-to-br from-primary/15 via-secondary/10 to-soft-highlight blur-2xl"
          aria-hidden="true"
        />

        {/* Phone frame */}
        <div className="relative rounded-[2.6rem] border border-foreground/10 bg-foreground/95 p-2.5 shadow-2xl shadow-primary/20">
          {/* Inner screen */}
          <div className="relative overflow-hidden rounded-[2rem] bg-[#e5ddd5]">
            {/* Notch */}
            <div className="absolute top-2 left-1/2 z-10 -translate-x-1/2">
              <div className="flex h-5 w-24 items-center justify-center rounded-full bg-foreground/95">
                <div className="h-1 w-1 rounded-full bg-foreground/60" />
              </div>
            </div>

            {/* WhatsApp header */}
            <div className="relative flex items-center gap-3 bg-[#075e54] px-4 pt-7 pb-2.5 text-white">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-white/15 font-display text-sm font-semibold">
                HK
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold leading-tight">
                  HastKala BolKeBecho
                </p>
                <p className="truncate text-[11px] leading-tight text-white/70">
                  online · auto-translates 5 languages
                </p>
              </div>
              <button
                type="button"
                onClick={onReplay}
                className="rounded-full p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Replay"
                title="Replay"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Chat scroll area */}
            <div
              ref={scrollRef}
              className="relative h-[460px] space-y-1.5 overflow-y-auto py-3 [scrollbar-width:thin]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path fill='%23d9d2c8' fill-opacity='0.35' d='M0 0h1v1H0zM12 12h1v1h-1z'/></svg>\")",
                backgroundColor: "#e5ddd5",
              }}
              aria-live="polite"
              aria-busy={!paused}
            >
              {items.length === 0 ? (
                <div className="flex h-full items-center justify-center text-[12px] text-foreground/40">
                  Starting demo…
                </div>
              ) : (
                items.map((item, i) =>
                  item.kind === "typing" ? (
                    <TypingIndicator
                      key={item.id}
                      author={
                        DEMO_TRANSCRIPT[Math.min(i, DEMO_TRANSCRIPT.length - 1)]?.author ?? "bot"
                      }
                    />
                  ) : (
                    <Bubble key={item.bubble.id} bubble={item.bubble} reduce={reduce} />
                  ),
                )
              )}
            </div>

            {/* Composer (decorative — non-interactive) */}
            <div className="flex items-center gap-2 bg-[#f0f0f0] px-3 py-2">
              <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] text-foreground/40">
                <span>Type a message</span>
              </div>
              <div className="grid h-8 w-8 place-items-center rounded-full bg-[#075e54] text-white">
                <Mic className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer caption */}
        <p className="mt-4 text-center text-[11px] text-muted-foreground">{t("home.demoFooter")}</p>
      </div>

      {/* Local keyframes — scoped via global stylesheet would also work, but
          keeping the demo self-contained avoids leaking animation names. */}
      <style>{`
        @keyframes botdemoSlideInLeft {
          from { opacity: 0; transform: translate3d(-8px, 4px, 0) scale(0.98); }
          to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes botdemoSlideInRight {
          from { opacity: 0; transform: translate3d(8px, 4px, 0) scale(0.98); }
          to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes botdemoBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%           { transform: translateY(-3px); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

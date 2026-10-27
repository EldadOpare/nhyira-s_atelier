// A portfolio index built as a wheel you turn.
//
// At rest the work sits in a ring around a title, each card tangent to the
// circle. The first notch of scroll blows the ring open into a vertical drum:
// the card at the front lies flat and full size, the ones above and below
// rotate away into hard perspective and run off the top and bottom of the
// frame. Keep turning and the drum carries the next piece round to the front.
//
// The whole thing is one number - `turn` - read by a single rAF pass that writes
// transforms straight to the DOM. 0 is the ring, 1 is the drum with item 0 at
// the front, and every whole number after that is one more item turned past.
import * as React from "react";

import { cn } from "@/lib/utils";

export interface WorksWheelItem {
  /** Project name. Shown beside the front card and in the index. */
  title: string;
  /** Cover art. Any src an <img> takes. */
  image: string;
  /** Where the card links to. Omit for a wheel that only browses. */
  href?: string;
}

export interface WorksWheelProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children"
> {
  items: WorksWheelItem[];
  /** Sits in the middle of the ring. @default undefined */
  label?: string;
  /** Label on the card's hover affordance. Omit to drop it. @default undefined */
  action?: string;
  /**
   * Tall element the wheel is pinned inside (it should hold a sticky stage).
   * When given, scroll progress through it turns the wheel - and scrolling back
   * up turns it back - instead of the wheel capturing the mouse wheel and drags.
   */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  /** Called with the item's index when the front card is clicked (not dragged). */
  onItemSelect?: (index: number) => void;
}

/* Geometry. The card is measured against the stage; everything else is measured
   against the card, so a narrow stage - where the card is capped by width, not
   height - scales the whole wheel down with it instead of leaving a small card
   swinging on a huge drum. The three that matter are tuned together: STEP
   against DRUM sets how hard the neighbours rotate away, and DRUM against LENS
   decides whether they land inside the frame or run off it. */
const CARD_H = 0.54; // front card height, of the stage
const CARD_MAX_W = 0.42; // ... but never wider than this much of the stage
const CARD_RATIO = 0.78; // card width / height - portrait, like the photos it carries
const STEP = 40; // degrees between cards on the drum
const DRUM = 2.22; // drum radius, in card heights - and everything below likewise
const LENS = 2.7; // perspective distance
const RING_R = 0.62; // ring radius - small enough that upright cards stay inside the stage
const RING_FACE = 0.58; // largest a card gets while it sits in the ring
/* The drum alone hangs the work on a plumb line. It isn't one: the strip curves
   away round an arc whose centre sits off to the LEFT, so the piece at the front
   is at the arc's near point - dead centre - and its neighbours have already
   swung back left as well as up and down. BOW is that arc's radius; nothing else
   makes the difference between a stack of cards and a wheel seen side on. */
const BOW = 1.82;
const TITLE = 0.085; // ring label and front-card title
const INDEX = 0.04; // the index down the right-hand side
/** Items either side of the front still worth drawing. Past this a card is
    edge-on, and further round it would stack up on the vanishing point. */
const CULL = 1.6;

/** How much of a wheel-notch or a dragged pixel counts as one item. */
const WHEEL_UNITS = 900;
const DRAG_UNITS = 420;
/** Quiet time after the last wheel event before the wheel settles on an item. */
const SETTLE = 140;
/** Fraction of the remaining distance closed each frame. 1 = no smoothing. */
const EASE = 0.12;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Stage = { w: number; h: number };

const rad = (deg: number) => (deg * Math.PI) / 180;

/** How far left the arc has carried something that has turned `drumDeg` off the
    front. Zero at the front, so the piece being read stays centred. */
const bowAt = (drumDeg: number, bow: number) =>
  -bow * (1 - Math.cos(rad(drumDeg)));

/** Both states in one chain: the ring terms fall away as `m` reaches the drum,
    and the drum terms are still zero while the ring is up. The bow is applied
    first, in the wheel's own plane, so it slides the card sideways rather than
    turning with it - and perspective still shrinks it with distance. */
function place(
  ringDeg: number,
  drumDeg: number,
  ringR: number,
  drumR: number,
  bow: number,
  m: number,
) {
  return (
    // Ring cards stay upright - they are placed on the circle, not turned round
    // it - so every photo reads the right way up.
    `translate(${m * bowAt(drumDeg, bow) + (1 - m) * ringR * Math.sin(rad(ringDeg))}px,` +
    ` ${-(1 - m) * ringR * Math.cos(rad(ringDeg))}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

export function WorksWheel({
  items,
  label = "Works '26",
  action = "View",
  onItemSelect,
  scrollContainerRef,
  className,
  ...props
}: WorksWheelProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLElement | null)[]>([]);
  const labelRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLDivElement>(null);

  // The wheel's position, and where it is heading. Only `active` is state -
  // everything else is written to the DOM, so turning the wheel is not a render.
  const turn = React.useRef(0);
  const target = React.useRef(0);
  const [active, setActive] = React.useState(0);
  const [stage, setStage] = React.useState<Stage>({ w: 0, h: 0 });

  const count = items.length;
  const last = Math.max(count - 1, 0);

  // Read after mount, not during render: the server has no matchMedia, and
  // branching on it inline is a hydration mismatch. Reduced motion drops the
  // easing, so the wheel lands where it is put instead of gliding there.
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const metrics = React.useMemo(() => {
    const { w, h } = stage;
    const compact = w < 640;
    const cardW = Math.min(h * CARD_H * CARD_RATIO, w * (compact ? 0.7 : CARD_MAX_W));
    const cardH = cardW / CARD_RATIO;
    const drumR = cardH * DRUM;
    // Keep the side cards of the ring inside the stage on a narrow screen.
    const sideSpace = w / 2 - cardW / 2 - w * 0.06 - 24;
    const face = compact ? 0.44 : RING_FACE;
    const ringR = Math.min(
      cardH * RING_R,
      (w / 2 - cardW * face * 0.5 - 8) / 0.95,
      // Keep the ring clear of the title above it and the list below it.
      compact || w < 760 ? h * 0.5 - cardH * face * 0.5 - h * 0.17 : Infinity,
    );
    // Shrink the ring's cards until the circle reads as a closed loop rather
    // than beads on a wire, however many pieces the wheel is given.
    const chord = count > 1 ? 2 * ringR * Math.sin(Math.PI / count) : ringR;
    const ringScale = count
      ? clamp(Math.min(face, (chord * 0.86) / (cardW || 1)), 0.16, face)
      : 1;
    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR,
      bow: cardH * BOW,
      depth: cardH * LENS,
      // On a phone the card is small, so type sized off it would be unreadable.
      title: Math.max(cardH * TITLE, compact ? 18 : 0),
      index: Math.max(cardH * INDEX, compact ? 11 : 0),
      compact,
      // Room left of the front card for its name. When there is not enough, the
      // name moves above the card instead of wrapping behind it.
      sideSpace,
      stackTitle: compact || sideSpace < 230,
    };
  }, [stage, count]);

  // One pass per frame: ease toward the target, then write every transform.
  React.useEffect(() => {
    if (!stage.h) return;
    let frame = 0;
    const { ringR, ringScale, drumR, bow } = metrics;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const gap = target.current - turn.current;
      if (Math.abs(gap) < 0.0005) turn.current = target.current;
      else turn.current += gap * (reduced ? 1 : EASE);

      const t = turn.current;
      const m = clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);

      // The drum is pulled back so its front face lands on the picture plane.
      // That set-back has to arrive with the drum, or the ring would sit at the
      // far side of the perspective and render at half its size.
      if (wheelRef.current) {
        wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`;
      }

      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const drumDeg = d * STEP;
        const card = cardRefs.current[i];
        if (card) {
          card.style.transform = place(
            d * (360 / count),
            drumDeg,
            ringR,
            drumR,
            bow,
            m,
          );
          // Culled by distance, not by angle: at a full turn the far side comes
          // back round to face us, and everything past the neighbours lands on
          // the vanishing point in a heap.
          card.style.opacity = m > 0.5 && Math.abs(d) > CULL ? "0" : "1";
          card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
        }
        const face = card?.firstElementChild as HTMLElement | null;
        if (face) face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
      }

      if (labelRef.current) labelRef.current.style.opacity = String(1 - m);
      if (titleRef.current) titleRef.current.style.opacity = String(m);
      const near = clamp(Math.round(pos), 0, last);
      setActive((prev) => (prev === near ? prev : near));
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [metrics, stage.h, count, last, reduced]);

  const scrollDriven = Boolean(scrollContainerRef);

  /** Scroll offset (px, from the container's top) at which item `n` is in front. */
  const scrollTo = React.useCallback(
    (n: number) => {
      const el = scrollContainerRef?.current;
      if (!el) return;
      const range = el.offsetHeight - window.innerHeight;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: top + (clamp(n, 0, last + 1) / (last + 1)) * range,
        behavior: "smooth",
      });
    },
    [scrollContainerRef, last],
  );

  const to = React.useCallback(
    (next: number) => {
      target.current = clamp(next, 0, last + 1);
    },
    [last],
  );

  // Once the wheel has scrolled fully out of view, put it back to the ring, so
  // coming back to it - from either side - looks as it did the first time.
  const rootRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || scrollDriven) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) return;
      target.current = 0;
      turn.current = 0;
    });
    io.observe(el);
    return () => io.disconnect();
  }, [scrollDriven]);

  const drag = React.useRef<number | null>(null);
  const dragged = React.useRef(0);
  const settling = React.useRef(0);

  // Scroll-driven: progress through the container sets the target. Each item
  // dwells at the front (the fraction is eased) so the wheel rests on a piece
  // instead of between two.
  React.useEffect(() => {
    const el = scrollContainerRef?.current;
    if (!el) return;
    const read = () => {
      const range = el.offsetHeight - window.innerHeight;
      const progress =
        range > 0 ? clamp(-el.getBoundingClientRect().top / range, 0, 1) : 0;
      const x = progress * (last + 1);
      const whole = Math.min(Math.floor(x), last);
      const f = x - whole;
      const dwell = clamp((f - 0.2) / 0.6, 0, 1);
      target.current = whole + dwell * dwell * (3 - 2 * dwell);
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [scrollContainerRef, last]);

  // Native listener, because the wheel has to be cancellable - and it only
  // cancels while it still has somewhere to go, so the page scrolls on at
  // either end instead of trapping the reader.
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el || scrollDriven) return;
    const onWheel = (event: WheelEvent) => {
      const next = target.current + event.deltaY / WHEEL_UNITS;
      if (next > 0 && next < last + 1) event.preventDefault();
      to(next);
      // A wheel gesture arrives as a burst of events with no end of its own, so
      // the rest position is whatever notch it happened to stop on. Left there
      // the drum sits between two cards - nothing at the front, and the pair
      // either side of the gap both turned half away. Settle onto an item.
      window.clearTimeout(settling.current);
      settling.current = window.setTimeout(
        () => to(Math.round(target.current)),
        SETTLE,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(settling.current);
    };
  }, [to, last, scrollDriven]);

  return (
    <section
      ref={rootRef}
      aria-label={label}
      className={cn(
        "bg-background text-foreground relative h-full min-h-[24rem] w-full overflow-hidden select-none",
        className,
      )}
      {...props}
    >
      <div
        ref={stageRef}
        tabIndex={0}
        role="listbox"
        aria-label={label}
        aria-activedescendant={`works-wheel-${active}`}
        className={cn(
          "focus-visible:outline-foreground absolute inset-0 outline-none focus-visible:outline-2 focus-visible:-outline-offset-4",
          scrollDriven ? "touch-pan-y" : "cursor-grab touch-pan-x active:cursor-grabbing",
        )}
        style={{ perspective: `${metrics.depth}px` }}
        onPointerDown={(event) => {
          if (scrollDriven) return;
          drag.current = event.clientY;
          dragged.current = 0;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (scrollDriven || drag.current === null) return;
          dragged.current += Math.abs(drag.current - event.clientY);
          to(target.current + (drag.current - event.clientY) / DRAG_UNITS);
          drag.current = event.clientY;
        }}
        onPointerUp={() => {
          // Land on an item rather than between two.
          drag.current = null;
          if (target.current > 1) to(Math.round(target.current));
        }}
        onClick={() => {
          // Pointer capture sends the click to the stage, so a click on the
          // front card is read here - and only if the pointer did not travel.
          if (dragged.current < 6 && turn.current > 0.95) onItemSelect?.(active);
        }}
        onKeyDown={(event) => {
          const go = scrollDriven ? scrollTo : to;
          if (event.key === "ArrowDown") go(Math.round(target.current) + 1);
          else if (event.key === "ArrowUp") go(Math.round(target.current) - 1);
          else if (event.key === "Enter" && turn.current > 0.95) onItemSelect?.(active);
          else return;
          event.preventDefault();
        }}
      >
        <div
          ref={wheelRef}
          className="absolute top-1/2 left-1/2 [transform-style:preserve-3d]"
          // Where the title sits above the wheel, drop the wheel a little so the two do not touch.
          style={{ marginTop: metrics.stackTitle ? stage.h * 0.06 : 0 }}
        >
          {items.map((item, i) => {
            const Tag = (item.href ? "a" : "div") as "a";
            return (
              <React.Fragment key={`${item.title}-${i}`}>
                <Tag
                  id={`works-wheel-${i}`}
                  role="option"
                  aria-selected={i === active}
                  href={item.href}
                  ref={(node: HTMLElement | null) => {
                    cardRefs.current[i] = node;
                  }}
                  className="group absolute [backface-visibility:hidden]"
                  style={{
                    width: metrics.cardW,
                    height: metrics.cardH,
                    marginLeft: -metrics.cardW / 2,
                    marginTop: -metrics.cardH / 2,
                  }}
                >
                  <span className="bg-muted shadow-foreground/12 relative block size-full overflow-hidden rounded-[18px] shadow-[0_18px_40px_-18px_var(--tw-shadow-color)]">
                    <img
                      src={item.image}
                      alt={item.title}
                      draggable={false}
                      className="size-full object-cover"
                    />
                    {action && (item.href || onItemSelect) ? (
                      <span className="bg-background/80 text-foreground pointer-events-none absolute right-3 bottom-3 flex translate-y-1 items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem] opacity-0 backdrop-blur-sm transition group-hover:translate-y-0 group-hover:opacity-100">
                        <svg
                          viewBox="0 0 12 12"
                          className="size-2.5"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 9 9 3M4 3h5v5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {action}
                      </span>
                    ) : null}
                  </span>
                </Tag>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Ring title and front-card title trade places across the transition.
          Type is sized off the measured stage, not vh, so the wheel keeps its
          proportions inside a card as well as at full bleed. */}
      <div
        ref={labelRef}
        className={cn(
          "pointer-events-none absolute tracking-tight",
          // Centred in the ring on a wide stage; above it on a phone, where the ring is full.
          metrics.stackTitle ? "inset-x-4 top-[6%] text-center" : "inset-0 grid place-items-center",
        )}
        style={{ fontSize: metrics.title }}
      >
        {label}
      </div>
      <div
        ref={titleRef}
        className={cn(
          "pointer-events-none absolute tracking-tight opacity-0 text-balance leading-[1.05]",
          // Beside the card on a wide stage; above it, centred, when that is too tight.
          metrics.stackTitle
            ? "inset-x-4 top-[6%] text-center"
            : "top-1/2 -translate-y-1/2",
        )}
        style={{
          fontSize: metrics.stackTitle ? metrics.title : Math.min(metrics.title, 44),
          ...(metrics.stackTitle ? {} : { left: "6%", width: metrics.sideSpace }),
        }}
      >
        {items[active]?.title}
      </div>

      <ol
        className={cn(
          "text-muted-foreground absolute leading-[1.75]",
          // Down the right on a wide stage; along the bottom on a phone, clear of the title.
          metrics.compact
            ? "inset-x-4 bottom-[4%] flex flex-wrap justify-center gap-x-4 text-center"
            : "top-[7.5%] right-[2.5%] text-right",
        )}
        style={{ fontSize: metrics.index }}
      >
        {items.map((item, i) => (
          <li key={`${item.title}-${i}`}>
            <button
              type="button"
              onClick={() => (scrollDriven ? scrollTo : to)(i + 1)}
              className={cn(
                "focus-visible:outline-foreground cursor-pointer transition-colors outline-none focus-visible:outline-1",
                i === active && "text-foreground font-medium",
              )}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default WorksWheel;

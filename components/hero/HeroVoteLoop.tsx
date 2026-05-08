"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import confetti from "canvas-confetti";
import { Check } from "lucide-react";

const SELECTED_INDEX = 1;

export function HeroVoteLoop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedPillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.set(".pill", { y: 8 });
      gsap.set(".pill-check", { scale: 0.5 });

      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1,
        defaults: { ease: "power2.out" },
      });

      // 1. Reveal
      tl.to(".pill", {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
      });

      // 2. Scanning pulse
      tl.to(
        ".pill",
        {
          scale: 1.02,
          duration: 0.25,
          ease: "sine.inOut",
          stagger: { each: 0.18, yoyo: true, repeat: 1 },
        },
        "+=0.15"
      );

      // 3. Select
      const sel = `.pill[data-index="${SELECTED_INDEX}"]`;
      tl.addLabel("select", "+=0.15")
        .to(sel, { scale: 1.06, duration: 0.3, ease: "back.out(1.4)" }, "select")
        .to(`${sel} .pill-dot-fill`, { opacity: 1, duration: 0.25 }, "select+=0.05")
        .to(
          `${sel} .pill-check`,
          { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" },
          "select+=0.15"
        );

      // 4. Confetti at the selected pill
      tl.call(
        () => fireConfetti(selectedPillRef.current),
        undefined,
        "select+=0.4"
      );

      // 5. Wash pills
      tl.to(
        ".pill",
        {
          opacity: 0,
          y: -6,
          duration: 0.5,
          ease: "power2.in",
          stagger: 0.04,
        },
        "+=0.6"
      );

      // 6. Reset
      tl.set(".pill", { y: 8, scale: 1 })
        .set(".pill-dot-fill", { opacity: 0 })
        .set(".pill-check", { opacity: 0, scale: 0.5 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden md:block"
    >
      <div className="absolute top-1/2 start-[6%] flex -translate-y-1/2 flex-col gap-4 opacity-70">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={i === SELECTED_INDEX ? selectedPillRef : undefined}
            data-index={i}
            className="pill flex h-12 w-64 items-center gap-3 rounded-full border border-border bg-card/80 px-4 opacity-0 shadow-sm backdrop-blur-sm motion-reduce:opacity-100"
          >
            <div className="relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-muted-foreground/40">
              <div className="pill-dot-fill absolute inset-0 rounded-full bg-primary opacity-0" />
              <Check
                className="pill-check relative h-3.5 w-3.5 text-primary-foreground opacity-0"
                strokeWidth={3}
              />
            </div>
            <div className="h-1.5 flex-1 rounded-full bg-muted-foreground/30" />
          </div>
        ))}
      </div>
    </div>
  );
}

function fireConfetti(target: HTMLDivElement | null) {
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  const cs = getComputedStyle(document.documentElement);
  const colors = ["--primary", "--accent", "--ring"]
    .map((v) => cs.getPropertyValue(v).trim())
    .filter(Boolean);

  void confetti({
    particleCount: 50,
    spread: 65,
    startVelocity: 30,
    gravity: 0.7,
    scalar: 0.9,
    ticks: 110,
    origin: { x, y },
    colors: colors.length > 0 ? colors : undefined,
    disableForReducedMotion: true,
  });
}

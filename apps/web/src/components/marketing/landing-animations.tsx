'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

/* ─── prefers-reduced-motion helper ─────────────────────────── */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

/* ─── IntersectionObserver factory ──────────────────────────── */
function useInView(threshold = 0.12): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

/* ──────────────────────────────────────────────────────────────
 * HeroSequence — fade+translateY entrance for hero elements
 * Each child receives a sequential delay so they enter one by one.
 * ────────────────────────────────────────────────────────────── */
export function HeroSequence({
  children,
  stepMs = 90,
  baseDelay = 60,
}: {
  children: React.ReactNode;
  stepMs?: number;
  baseDelay?: number;
}) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small RAF so the initial paint completes before we animate in
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <>
      {React.Children.map(children, (child, i) => (
        <div
          key={i}
          style={
            reduced
              ? {}
              : {
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 320ms cubic-bezier(0.16,1,0.3,1) ${baseDelay + i * stepMs}ms,
                               transform 360ms cubic-bezier(0.16,1,0.3,1) ${baseDelay + i * stepMs}ms`,
                }
          }
        >
          {child}
        </div>
      ))}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
 * ScrollReveal — fade+slide on viewport enter (once)
 * ────────────────────────────────────────────────────────────── */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const [ref, visible] = useInView(0.10);

  return (
    <div
      ref={ref}
      className={className}
      style={
        reduced
          ? {}
          : {
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(22px)',
              transition: `opacity 560ms cubic-bezier(0.16,1,0.3,1) ${delay}ms,
                           transform 560ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
            }
      }
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * StaggerContainer — reveals children one-by-one as section enters
 * ────────────────────────────────────────────────────────────── */
export function StaggerContainer({
  children,
  staggerMs = 70,
  baseDelay = 0,
  className = '',
}: {
  children: React.ReactNode;
  staggerMs?: number;
  baseDelay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.06 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, i) => (
        <div
          key={i}
          style={
            reduced
              ? {}
              : {
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 480ms cubic-bezier(0.16,1,0.3,1) ${baseDelay + i * staggerMs}ms,
                               transform 480ms cubic-bezier(0.16,1,0.3,1) ${baseDelay + i * staggerMs}ms`,
                }
          }
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * LivePollBars — animated poll bars in hero mockup
 * ────────────────────────────────────────────────────────────── */
const POLL_OPTIONS = [
  { label: 'Strongly agree', color: 'var(--brand)' },
  { label: 'Agree',          color: 'var(--data-3)' },
  { label: 'Neutral',        color: 'var(--data-5)' },
  { label: 'Disagree',       color: 'var(--data-7)' },
];

const BASE_VALUES = [72, 48, 18, 8];

export function LivePollBars() {
  const reduced = useReducedMotion();
  const [values, setValues] = useState(BASE_VALUES);
  const totalRef = useRef(BASE_VALUES.reduce((s, v) => s + v, 0));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initial animate-in delay
    const t = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setValues((prev) => {
        const pick = Math.floor(Math.random() * 4);
        const next = [...prev] as number[];
        next[pick] = (next[pick] ?? 0) + 1;
        totalRef.current += 1;
        return next;
      });
    }, 1100);
    return () => clearInterval(id);
  }, [reduced]);

  const total = totalRef.current;

  return (
    <div className="space-y-2">
      {POLL_OPTIONS.map((opt, i) => {
        const pct = Math.round(((values[i] ?? 0) / total) * 100);
        return (
          <div key={opt.label}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span style={{ color: 'var(--text-primary)', fontSize: 11 }}>
                {opt.label}
              </span>
              <span
                style={{
                  color: 'var(--text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: 11,
                }}
              >
                {pct}%
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full"
              style={{ background: 'var(--surface-raised)' }}
            >
              <div
                style={{
                  width: mounted ? `${pct}%` : '0%',
                  height: '100%',
                  background: opt.color,
                  borderRadius: 99,
                  transition: reduced
                    ? 'none'
                    : `width 800ms cubic-bezier(0.16,1,0.3,1) ${i * 60}ms`,
                }}
              />
            </div>
          </div>
        );
      })}
      <p
        className="pt-1 text-right font-mono"
        style={{ color: 'var(--text-muted)', fontSize: 10 }}
      >
        {total} votes · live
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * AnimatedCounter — counts up when it enters viewport (once)
 * ────────────────────────────────────────────────────────────── */
export function AnimatedCounter({
  target,
  prefix = '',
  suffix = '',
  duration = 1600,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    if (reduced) { setCount(target); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration, reduced]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────
 * GlowCard — radial spotlight follows the cursor within the card
 * ────────────────────────────────────────────────────────────── */
export function GlowCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
  }, [reduced]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--glow-x', '-999px');
    el.style.setProperty('--glow-y', '-999px');
  }, []);

  return (
    <div
      ref={ref}
      className={`glow-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * CursorParallax — hero mockup follows cursor by a small amount
 * Desktop only; disabled when reduced motion is preferred.
 * ────────────────────────────────────────────────────────────── */
export function CursorParallax({
  children,
  strength = 4,
  className = '',
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = ((e.clientX - cx) / cx) * strength;
        const dy = ((e.clientY - cy) / cy) * strength;
        setOffset({ x: dx, y: dy });
      });
    };

    // Only apply on non-touch devices
    const mq = window.matchMedia('(pointer: fine)');
    if (!mq.matches) return;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced, strength]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: reduced
          ? 'none'
          : `translate(${offset.x}px, ${offset.y}px)`,
        transition: 'transform 600ms cubic-bezier(0.16,1,0.3,1)',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * FloatingShape — gentle Y oscillation for decorative elements
 * ────────────────────────────────────────────────────────────── */
export function FloatingShape({
  children,
  amplitude = 8,
  periodMs = 5000,
  phaseMs = 0,
  className = '',
}: {
  children: React.ReactNode;
  amplitude?: number;
  periodMs?: number;
  phaseMs?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [y, setY] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;

    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current + phaseMs;
      const value = Math.sin((elapsed / periodMs) * 2 * Math.PI) * amplitude;
      setY(value);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced, amplitude, periodMs, phaseMs]);

  return (
    <div
      className={className}
      style={{
        transform: reduced ? 'none' : `translateY(${y}px)`,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * PulsingBadge — notification count with a subtle scale pulse
 * ────────────────────────────────────────────────────────────── */
export function PulsingBadge({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`pulsing-badge ${className}`}>
      {children}
    </span>
  );
}
'use client';

import React, { useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/* Scroll Reveal — wrap any section to fade/slide it in on scroll      */
/* ------------------------------------------------------------------ */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
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
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stagger Container — reveals children one after another              */
/* ------------------------------------------------------------------ */
export function StaggerContainer({
  children,
  staggerMs = 80,
  baseDelay = 0,
  className = '',
}: {
  children: React.ReactNode;
  staggerMs?: number;
  baseDelay?: number;
  className?: string;
}) {
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
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, i) => (
        <div
          key={i}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: `opacity 0.55s ease ${baseDelay + i * staggerMs}ms, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${baseDelay + i * staggerMs}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Live Poll Bars — animated progress bars in the hero mockup          */
/* ------------------------------------------------------------------ */
const POLL_OPTIONS = [
  { label: 'Strongly agree', color: 'var(--brand)' },
  { label: 'Agree', color: 'var(--data-3)' },
  { label: 'Neutral', color: 'var(--data-5)' },
  { label: 'Disagree', color: 'var(--data-7)' },
];

const BASE_VALUES = [72, 48, 18, 8];

export function LivePollBars() {
  const [values, setValues] = useState(BASE_VALUES);
  const totalRef = useRef(BASE_VALUES.reduce((s, v) => s + v, 0));

  useEffect(() => {
    const id = setInterval(() => {
      setValues((prev) => {
        const pick = Math.floor(Math.random() * 4);
        const next = [...prev] as number[];
        next[pick] = (next[pick] ?? 0) + 1;
        totalRef.current += 1;
        return next;
      });
    }, 900);
    return () => clearInterval(id);
  }, []);

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
                  width: `${pct}%`,
                  height: '100%',
                  background: opt.color,
                  borderRadius: 99,
                  transition: 'width 0.75s cubic-bezier(0.22,1,0.36,1)',
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

/* ------------------------------------------------------------------ */
/* Animated Counter — counts up when it enters the viewport            */
/* ------------------------------------------------------------------ */
export function AnimatedCounter({
  target,
  prefix = '',
  suffix = '',
  duration = 1800,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
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
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Glow Card — tracks mouse position to show a radial spotlight effect */
/* ------------------------------------------------------------------ */
export function GlowCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--glow-x', '-999px');
    el.style.setProperty('--glow-y', '-999px');
  };

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
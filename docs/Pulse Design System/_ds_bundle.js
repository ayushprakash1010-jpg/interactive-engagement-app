/* @ds-bundle: {"format":3,"namespace":"PulseDesignSystem_424f5e","components":[{"name":"ActivityTile","sourcePath":"components/activity/ActivityTile.jsx"},{"name":"JoinCode","sourcePath":"components/activity/JoinCode.jsx"},{"name":"LeaderboardRow","sourcePath":"components/activity/LeaderboardRow.jsx"},{"name":"LiveDot","sourcePath":"components/activity/LiveDot.jsx"},{"name":"PollResult","sourcePath":"components/activity/PollResult.jsx"},{"name":"QuestionCard","sourcePath":"components/activity/QuestionCard.jsx"},{"name":"AISparkle","sourcePath":"components/ai/AIBadge.jsx"},{"name":"AIBadge","sourcePath":"components/ai/AIBadge.jsx"},{"name":"AIComposer","sourcePath":"components/ai/AIComposer.jsx"},{"name":"AISummaryCard","sourcePath":"components/ai/AISummaryCard.jsx"},{"name":"SuggestionChip","sourcePath":"components/ai/SuggestionChip.jsx"},{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Stat","sourcePath":"components/core/Stat.jsx"},{"name":"Switch","sourcePath":"components/core/Switch.jsx"},{"name":"Textarea","sourcePath":"components/core/Textarea.jsx"}],"sourceHashes":{"components/activity/ActivityTile.jsx":"14e28dfe85aa","components/activity/JoinCode.jsx":"29104dc81d18","components/activity/LeaderboardRow.jsx":"afb96ce0612d","components/activity/LiveDot.jsx":"1944e2ae75ca","components/activity/PollResult.jsx":"674d71452c2b","components/activity/QuestionCard.jsx":"8767cc2bcbb6","components/ai/AIBadge.jsx":"5eee3c8cca87","components/ai/AIComposer.jsx":"296dd19c5baa","components/ai/AISummaryCard.jsx":"c043fd0c041f","components/ai/SuggestionChip.jsx":"571d039f64a7","components/core/Avatar.jsx":"dabb61e256a0","components/core/Badge.jsx":"58ab05c8c4c7","components/core/Button.jsx":"dd46dcf8363a","components/core/Card.jsx":"0a917ce9f775","components/core/IconButton.jsx":"8155fb490c83","components/core/Input.jsx":"c9e345772db0","components/core/Stat.jsx":"49f852a5f729","components/core/Switch.jsx":"eee4a80f7b7d","components/core/Textarea.jsx":"d6fdd9e36d94","ui_kits/host/host.jsx":"2718797bb14f","ui_kits/marketing/marketing.jsx":"567e3295a62b","ui_kits/participant/participant.jsx":"4c639a730917","ui_kits/projector/projector.jsx":"2cc455c9fb39"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.PulseDesignSystem_424f5e = window.PulseDesignSystem_424f5e || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/activity/ActivityTile.jsx
try { (() => {
/**
 * Activity-type tile for the builder ("Add a poll / quiz / word cloud…").
 * Pass a Lucide icon node. The five IEP activity types each get a tone.
 */
const TONES = {
  poll: {
    fg: 'var(--data-1)',
    bg: 'color-mix(in srgb, var(--data-1) 12%, white)'
  },
  quiz: {
    fg: 'var(--data-4)',
    bg: 'color-mix(in srgb, var(--data-4) 14%, white)'
  },
  wordcloud: {
    fg: 'var(--data-7)',
    bg: 'color-mix(in srgb, var(--data-7) 12%, white)'
  },
  qa: {
    fg: 'var(--data-6)',
    bg: 'color-mix(in srgb, var(--data-6) 12%, white)'
  },
  feedback: {
    fg: 'var(--data-3)',
    bg: 'color-mix(in srgb, var(--data-3) 14%, white)'
  },
  ai: {
    fg: 'var(--ai)',
    bg: 'var(--ai-subtle)'
  }
};
function ActivityTile({
  icon,
  title,
  description,
  type = 'poll',
  onClick,
  style = {}
}) {
  const t = TONES[type] || TONES.poll;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    onMouseEnter: e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      e.currentTarget.style.borderColor = t.fg;
      e.currentTarget.style.transform = 'translateY(-2px)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      e.currentTarget.style.borderColor = 'var(--border-subtle)';
      e.currentTarget.style.transform = 'translateY(0)';
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '0.75rem',
      textAlign: 'left',
      width: '100%',
      padding: 'var(--space-5)',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      cursor: 'pointer',
      transition: 'box-shadow var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '2.5rem',
      height: '2.5rem',
      borderRadius: 'var(--radius-md)',
      background: t.bg,
      color: t.fg
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-primary)'
    }
  }, title), description && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      lineHeight: 'var(--leading-snug)'
    }
  }, description));
}
Object.assign(__ds_scope, { ActivityTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/activity/ActivityTile.jsx", error: String((e && e.message) || e) }); }

// components/activity/JoinCode.jsx
try { (() => {
/**
 * Large mono join code, optionally with a copy affordance.
 * Mirrors the IEP projector treatment: tabular mono, wide tracking.
 */
function JoinCode({
  code = 'ABC123',
  size = 'md',
  onCopy,
  inverse = false,
  style = {}
}) {
  const fs = {
    sm: 'var(--text-xl)',
    md: 'var(--text-3xl)',
    lg: 'var(--text-5xl)',
    xl: 'var(--text-7xl)'
  }[size];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.75rem',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 'var(--weight-bold)',
      fontSize: fs,
      letterSpacing: 'var(--tracking-code)',
      color: inverse ? 'var(--text-on-dark)' : 'var(--text-primary)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, code), onCopy && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onCopy(code),
    "aria-label": "Copy code",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '2rem',
      height: '2rem',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-offset)',
      border: '1px solid var(--border-default)',
      color: 'var(--text-muted)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "9",
    y: "9",
    width: "13",
    height: "13",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
  }))));
}
Object.assign(__ds_scope, { JoinCode });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/activity/JoinCode.jsx", error: String((e && e.message) || e) }); }

// components/activity/LeaderboardRow.jsx
try { (() => {
const MEDALS = {
  1: '#d19900',
  2: '#9a9488',
  3: '#b87333'
};

/** One quiz leaderboard row: rank, avatar, name, points. Top 3 get a medal tint. */
function LeaderboardRow({
  rank = 1,
  name = 'Anonymous',
  points = 0,
  you = false,
  inverse = false,
  style = {}
}) {
  const medal = MEDALS[rank];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.625rem 0.875rem',
      borderRadius: 'var(--radius-md)',
      background: you ? 'var(--brand-subtle)' : inverse ? 'var(--surface-raised)' : 'var(--surface-offset)',
      border: you ? '1px solid var(--teal-300)' : '1px solid transparent',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '1.75rem',
      height: '1.75rem',
      flexShrink: 0,
      borderRadius: 'var(--radius-full)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-bold)',
      fontVariantNumeric: 'tabular-nums',
      background: medal ? medal : 'transparent',
      color: medal ? 'var(--white)' : 'var(--text-muted)'
    }
  }, rank), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-base)',
      fontWeight: you ? 'var(--weight-semibold)' : 'var(--weight-medium)',
      color: inverse ? 'var(--text-on-dark)' : 'var(--text-primary)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, name, you && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--brand)',
      fontWeight: 'var(--weight-regular)'
    }
  }, " \xB7 you")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-base)',
      fontWeight: 'var(--weight-bold)',
      fontVariantNumeric: 'tabular-nums',
      color: inverse ? 'var(--text-on-dark)' : 'var(--text-primary)'
    }
  }, points.toLocaleString(), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-faint)',
      fontWeight: 'var(--weight-regular)'
    }
  }, " pts")));
}
Object.assign(__ds_scope, { LeaderboardRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/activity/LeaderboardRow.jsx", error: String((e && e.message) || e) }); }

// components/activity/LiveDot.jsx
try { (() => {
/** The animated "on-air" dot. Pulses while live. */
function LiveDot({
  size = 8,
  color = 'var(--live)',
  live = true,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      width: size,
      height: size,
      ...style
    }
  }, live && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      background: color,
      animation: 'pulse-live 1.6s var(--ease-standard) infinite'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      width: size,
      height: size,
      borderRadius: '50%',
      background: color
    }
  }));
}
Object.assign(__ds_scope, { LiveDot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/activity/LiveDot.jsx", error: String((e && e.message) || e) }); }

// components/activity/PollResult.jsx
try { (() => {
const DATA = ['var(--data-1)', 'var(--data-2)', 'var(--data-3)', 'var(--data-4)', 'var(--data-5)', 'var(--data-6)', 'var(--data-7)', 'var(--data-8)'];

/**
 * A single horizontal poll-result bar with label, growing fill, count and %.
 * Compose several to make a live results chart. `index` picks the bar color
 * from the Pulse categorical data palette.
 */
function PollResult({
  label,
  count = 0,
  total = 0,
  index = 0,
  leading = false,
  inverse = false,
  style = {}
}) {
  const pct = total > 0 ? Math.round(count / total * 100) : 0;
  const color = DATA[index % DATA.length];
  const track = inverse ? 'rgba(255,255,255,0.08)' : 'var(--surface-offset)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: '0.75rem'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: leading ? 'var(--weight-semibold)' : 'var(--weight-medium)',
      color: inverse ? 'var(--text-on-dark)' : 'var(--text-primary)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      fontVariantNumeric: 'tabular-nums',
      color: inverse ? 'var(--text-on-dark)' : 'var(--text-secondary)'
    }
  }, pct, "% ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: inverse ? 'rgba(255,255,255,0.6)' : 'var(--text-faint)',
      fontWeight: 'var(--weight-regular)'
    }
  }, "\xB7 ", count))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: '0.625rem',
      borderRadius: 'var(--radius-full)',
      background: track,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      insetBlock: 0,
      left: 0,
      width: `${pct}%`,
      borderRadius: 'var(--radius-full)',
      background: color,
      transformOrigin: 'left',
      transition: 'width var(--dur-slow) var(--ease-out)',
      boxShadow: leading ? '0 0 0 2px color-mix(in srgb, ' + color + ' 30%, transparent)' : 'none'
    }
  })));
}
Object.assign(__ds_scope, { PollResult });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/activity/PollResult.jsx", error: String((e && e.message) || e) }); }

// components/activity/QuestionCard.jsx
try { (() => {
/**
 * Audience Q&A card: question text, author, upvote pill, and host moderation
 * state. Used in participant feed, host moderation queue, and projector.
 */
function QuestionCard({
  text,
  author = 'Anonymous',
  votes = 0,
  voted = false,
  onUpvote,
  status,
  answered = false,
  inverse = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.875rem',
      alignItems: 'flex-start',
      padding: 'var(--space-4)',
      borderRadius: 'var(--radius-lg)',
      background: inverse ? 'var(--surface-raised)' : 'var(--surface-card)',
      border: `1px solid ${answered ? 'var(--success)' : 'var(--border-subtle)'}`,
      opacity: answered ? 0.85 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onUpvote,
    "aria-pressed": voted,
    "aria-label": "Upvote",
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.125rem',
      minWidth: '2.75rem',
      padding: '0.375rem 0',
      flexShrink: 0,
      borderRadius: 'var(--radius-sm)',
      cursor: onUpvote ? 'pointer' : 'default',
      background: voted ? 'var(--brand-subtle)' : 'var(--surface-offset)',
      border: `1px solid ${voted ? 'var(--teal-300)' : 'var(--border-subtle)'}`,
      color: voted ? 'var(--brand)' : 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m18 15-6-6-6 6"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-bold)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, votes)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-base)',
      fontWeight: 'var(--weight-medium)',
      lineHeight: 'var(--leading-snug)',
      color: inverse ? 'var(--text-on-dark)' : 'var(--text-primary)'
    }
  }, text), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", null, author), answered && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--success)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, "Answered")), status === 'pending' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--warning)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, "Pending review")))));
}
Object.assign(__ds_scope, { QuestionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/activity/QuestionCard.jsx", error: String((e && e.message) || e) }); }

// components/ai/AIBadge.jsx
try { (() => {
/** Sparkles glyph used across AI surfaces (inline, no dependency). */
function AISparkle({
  size = 16,
  color = 'currentColor',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: style,
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"
  }));
}

/** Small "AI" / "AI generated" pill. `gradient` uses the iris→teal AI gradient. */
function AIBadge({
  label = 'AI',
  gradient = false,
  size = 'md',
  style = {}
}) {
  const sz = size === 'sm' ? {
    padding: '0.0625rem 0.5rem',
    font: 'var(--text-2xs)',
    icon: 11
  } : {
    padding: '0.1875rem 0.625rem',
    font: 'var(--text-xs)',
    icon: 13
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3125rem',
      padding: sz.padding,
      fontFamily: 'var(--font-sans)',
      fontSize: sz.font,
      fontWeight: 'var(--weight-semibold)',
      lineHeight: 1.4,
      letterSpacing: '0.02em',
      borderRadius: 'var(--radius-full)',
      whiteSpace: 'nowrap',
      background: gradient ? 'var(--ai-gradient)' : 'var(--ai-subtle)',
      color: gradient ? 'var(--white)' : 'var(--ai-subtle-text)',
      ...style
    }
  }, /*#__PURE__*/React.createElement(AISparkle, {
    size: sz.icon
  }), label);
}
Object.assign(__ds_scope, { AISparkle, AIBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ai/AIBadge.jsx", error: String((e && e.message) || e) }); }

// components/ai/AIComposer.jsx
try { (() => {
/**
 * AI prompt composer — the entry point for "describe it, Pulse drafts it."
 * A rounded iris-tinted field with a sparkle, optional suggestion chips,
 * and a generate button. Controlled via `value` + `onChange` + `onGenerate`.
 */
function AIComposer({
  value = '',
  onChange,
  onGenerate,
  placeholder = 'Describe your session — Pulse drafts the activities…',
  suggestions = [],
  loading = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      padding: 'var(--space-4)',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--ai-subtle)',
      border: '1px solid var(--ai-border)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.625rem',
      padding: '0.75rem 0.875rem',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-card)',
      border: '1px solid var(--ai-border)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ai)',
      marginTop: '0.125rem',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.AISparkle, {
    size: 18
  })), /*#__PURE__*/React.createElement("textarea", {
    rows: 2,
    value: value,
    placeholder: placeholder,
    onChange: e => onChange && onChange(e.target.value),
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      resize: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      lineHeight: 'var(--leading-normal)',
      color: 'var(--text-primary)'
    }
  })), suggestions.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem'
    }
  }, suggestions.map((s, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    type: "button",
    onClick: () => onChange && onChange(s),
    style: {
      padding: '0.3125rem 0.75rem',
      borderRadius: 'var(--radius-full)',
      background: 'var(--surface-card)',
      border: '1px dashed var(--ai-border)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--ai-subtle-text)',
      cursor: 'pointer'
    }
  }, s))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onGenerate,
    disabled: loading || !value.trim(),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      height: 'var(--control-md)',
      padding: '0 1.125rem',
      borderRadius: 'var(--radius-sm)',
      border: 'none',
      background: loading || !value.trim() ? 'var(--iris-200)' : 'var(--ai)',
      color: 'var(--white)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      cursor: loading || !value.trim() ? 'not-allowed' : 'pointer'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.AISparkle, {
    size: 15
  }), loading ? 'Generating…' : 'Generate')));
}
Object.assign(__ds_scope, { AIComposer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ai/AIComposer.jsx", error: String((e && e.message) || e) }); }

// components/ai/AISummaryCard.jsx
try { (() => {
/**
 * AI insight / summary card — distills open-text responses, Q&A themes, or
 * sentiment into a short readout. Iris-tinted with a sparkle header and an
 * optional list of bullet themes. `shimmer` shows the generating state.
 */
function AISummaryCard({
  title = 'AI summary',
  body,
  themes = [],
  shimmer = false,
  footnote,
  style = {}
}) {
  if (shimmer) {
    return /*#__PURE__*/React.createElement("div", {
      style: cardStyle
    }, /*#__PURE__*/React.createElement(Header, {
      title: title
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginTop: '0.25rem'
      }
    }, [100, 92, 78].map((w, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        height: '0.75rem',
        width: `${w}%`,
        borderRadius: 'var(--radius-full)',
        background: 'linear-gradient(90deg, var(--iris-100) 25%, var(--iris-50) 50%, var(--iris-100) 75%)',
        backgroundSize: '200% 100%',
        animation: 'pulse-shimmer 1.3s linear infinite'
      }
    }))));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: cardStyle
  }, /*#__PURE__*/React.createElement(Header, {
    title: title
  }), body && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      lineHeight: 'var(--leading-relaxed)',
      color: 'var(--text-secondary)'
    }
  }, body), themes.length > 0 && /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }
  }, themes.map((t, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-primary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '0.375rem',
      height: '0.375rem',
      borderRadius: '50%',
      background: 'var(--ai)',
      marginTop: '0.5rem',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", null, typeof t === 'string' ? t : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontWeight: 'var(--weight-semibold)'
    }
  }, t.label), t.count != null && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)'
    }
  }, " \xB7 ", t.count)))))), footnote && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-faint)',
      marginTop: '0.125rem'
    }
  }, footnote));
}
const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  padding: 'var(--space-5)',
  borderRadius: 'var(--radius-lg)',
  background: 'var(--ai-subtle)',
  border: '1px solid var(--ai-border)'
};
function Header({
  title
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ai)',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.AISparkle, {
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--ai-subtle-text)'
    }
  }, title));
}
Object.assign(__ds_scope, { AISummaryCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ai/AISummaryCard.jsx", error: String((e && e.message) || e) }); }

// components/ai/SuggestionChip.jsx
try { (() => {
/**
 * A single AI suggestion the host can accept — e.g. a drafted question,
 * a follow-up poll, or a moderation action. Iris-tinted with accept/dismiss.
 */
function SuggestionChip({
  text,
  onAccept,
  onDismiss,
  icon,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.625rem',
      padding: '0.5rem 0.5rem 0.5rem 0.875rem',
      borderRadius: 'var(--radius-full)',
      background: 'var(--surface-card)',
      border: '1px solid var(--ai-border)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ai)',
      display: 'inline-flex',
      flexShrink: 0
    }
  }, icon || /*#__PURE__*/React.createElement(__ds_scope.AISparkle, {
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-primary)',
      lineHeight: 'var(--leading-snug)'
    }
  }, text), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.25rem',
      flexShrink: 0
    }
  }, onDismiss && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onDismiss,
    "aria-label": "Dismiss",
    style: iconBtn('transparent', 'var(--text-faint)')
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  }))), onAccept && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onAccept,
    "aria-label": "Accept",
    style: iconBtn('var(--ai)', 'var(--white)')
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })))));
}
function iconBtn(bg, fg) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.75rem',
    height: '1.75rem',
    borderRadius: '50%',
    border: 'none',
    background: bg,
    color: fg,
    cursor: 'pointer'
  };
}
Object.assign(__ds_scope, { SuggestionChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ai/SuggestionChip.jsx", error: String((e && e.message) || e) }); }

// components/core/Avatar.jsx
try { (() => {
const PALETTE = ['#01696f', '#4f98a3', '#6daa45', '#d19900', '#da7101', '#006494', '#7a39bb', '#a12c7b'];
function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}
function colorFor(name) {
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = h * 31 + name.charCodeAt(i) >>> 0;
  return PALETTE[h % PALETTE.length];
}

/** Participant avatar — initials on a deterministic brand-palette fill, or an image. */
function Avatar({
  name = '',
  src,
  size = 'md',
  anonymous = false,
  style = {}
}) {
  const dim = {
    sm: '1.75rem',
    md: '2.25rem',
    lg: '2.75rem',
    xl: '3.5rem'
  }[size];
  const font = {
    sm: 'var(--text-xs)',
    md: 'var(--text-sm)',
    lg: 'var(--text-base)',
    xl: 'var(--text-lg)'
  }[size];
  const bg = anonymous ? 'var(--surface-sunken)' : colorFor(name);
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: dim,
      height: dim,
      flexShrink: 0,
      borderRadius: '50%',
      overflow: 'hidden',
      background: src ? 'var(--surface-sunken)' : bg,
      color: anonymous ? 'var(--text-muted)' : 'var(--white)',
      fontFamily: 'var(--font-sans)',
      fontSize: font,
      fontWeight: 'var(--weight-semibold)',
      ...style
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : anonymous ? '·' : initials(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: {
    bg: 'var(--surface-sunken)',
    fg: 'var(--text-secondary)',
    dot: 'var(--ink-700)'
  },
  brand: {
    bg: 'var(--brand-subtle)',
    fg: 'var(--brand-subtle-text)',
    dot: 'var(--brand)'
  },
  success: {
    bg: 'var(--success-subtle)',
    fg: 'var(--green-600)',
    dot: 'var(--success)'
  },
  warning: {
    bg: 'var(--warning-subtle)',
    fg: '#8a6500',
    dot: 'var(--warning)'
  },
  error: {
    bg: 'var(--error-subtle)',
    fg: 'var(--red-600)',
    dot: 'var(--error)'
  },
  info: {
    bg: 'var(--info-subtle)',
    fg: 'var(--blue-500)',
    dot: 'var(--info)'
  },
  ai: {
    bg: 'var(--ai-subtle)',
    fg: 'var(--ai-subtle-text)',
    dot: 'var(--ai)'
  },
  live: {
    bg: 'var(--success-subtle)',
    fg: 'var(--green-600)',
    dot: 'var(--live)'
  }
};

/** Compact status / category pill. `dot` adds a leading status dot; tone `live` animates it. */
function Badge({
  tone = 'neutral',
  dot = false,
  size = 'md',
  style = {},
  children,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  const sz = size === 'sm' ? {
    padding: '0.0625rem 0.5rem',
    font: 'var(--text-2xs)'
  } : {
    padding: '0.1875rem 0.625rem',
    font: 'var(--text-xs)'
  };
  const isLive = tone === 'live';
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      padding: sz.padding,
      fontFamily: 'var(--font-sans)',
      fontSize: sz.font,
      fontWeight: 'var(--weight-semibold)',
      lineHeight: 1.4,
      letterSpacing: '0.01em',
      borderRadius: 'var(--radius-full)',
      background: t.bg,
      color: t.fg,
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), (dot || isLive) && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      width: '0.4375rem',
      height: '0.4375rem',
      borderRadius: '50%',
      background: t.dot,
      flexShrink: 0,
      animation: isLive ? 'pulse-live 1.6s var(--ease-standard) infinite' : 'none'
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Pulse Button — the primary action primitive.
 * Variants map to the IEP action hierarchy; `ai` is reserved for
 * AI-assisted actions (generate, summarize, suggest).
 */
function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  iconLeft = null,
  iconRight = null,
  disabled = false,
  type = 'button',
  style = {},
  children,
  ...rest
}) {
  const sizes = {
    sm: {
      height: 'var(--control-sm)',
      padding: '0 0.75rem',
      font: 'var(--text-sm)',
      gap: '0.375rem'
    },
    md: {
      height: 'var(--control-md)',
      padding: '0 1rem',
      font: 'var(--text-sm)',
      gap: '0.5rem'
    },
    lg: {
      height: 'var(--control-lg)',
      padding: '0 1.25rem',
      font: 'var(--text-base)',
      gap: '0.5rem'
    },
    xl: {
      height: 'var(--control-xl)',
      padding: '0 1.75rem',
      font: 'var(--text-lg)',
      gap: '0.625rem'
    }
  }[size];
  const variants = {
    primary: {
      background: 'var(--brand)',
      color: 'var(--text-on-brand)',
      border: '1px solid transparent',
      '--hover-bg': 'var(--brand-hover)'
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-default)',
      '--hover-bg': 'var(--surface-offset)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
      '--hover-bg': 'var(--surface-offset)'
    },
    danger: {
      background: 'var(--error)',
      color: 'var(--white)',
      border: '1px solid transparent',
      '--hover-bg': 'var(--error-hover)'
    },
    ai: {
      background: 'var(--ai)',
      color: 'var(--white)',
      border: '1px solid transparent',
      '--hover-bg': 'var(--ai-hover)'
    }
  }[variant];
  const isDisabled = disabled || loading;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: isDisabled,
    onMouseEnter: e => {
      if (!isDisabled) e.currentTarget.style.background = variants['--hover-bg'];
    },
    onMouseLeave: e => {
      if (!isDisabled) e.currentTarget.style.background = variants.background;
    },
    style: {
      display: block ? 'flex' : 'inline-flex',
      width: block ? '100%' : 'auto',
      alignItems: 'center',
      justifyContent: 'center',
      gap: sizes.gap,
      height: sizes.height,
      padding: sizes.padding,
      fontFamily: 'var(--font-sans)',
      fontSize: sizes.font,
      fontWeight: 'var(--weight-semibold)',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      borderRadius: 'var(--radius-sm)',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled && !loading ? 0.5 : 1,
      transition: 'background var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',
      ...variants,
      ...style
    },
    onMouseDown: e => {
      if (!isDisabled) e.currentTarget.style.transform = 'translateY(1px)';
    },
    onMouseUp: e => {
      e.currentTarget.style.transform = 'translateY(0)';
    }
  }, rest), loading && /*#__PURE__*/React.createElement(Spinner, null), !loading && iconLeft, children, !loading && iconRight);
}
function Spinner() {
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      width: '1em',
      height: '1em',
      borderRadius: '50%',
      border: '2px solid currentColor',
      borderTopColor: 'transparent',
      display: 'inline-block',
      animation: 'spin 0.7s linear infinite'
    }
  }, /*#__PURE__*/React.createElement("style", null, `@keyframes spin{to{transform:rotate(360deg)}}`));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Surface container. `interactive` adds hover lift (use for clickable cards
 * like dashboard event tiles). `ai` themes the border/tint for AI panels.
 */
function Card({
  interactive = false,
  padding = 'md',
  tone = 'default',
  style = {},
  children,
  ...rest
}) {
  const pad = {
    none: 0,
    sm: 'var(--space-4)',
    md: 'var(--space-6)',
    lg: 'var(--space-8)'
  }[padding];
  const tones = {
    default: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)'
    },
    raised: {
      background: 'var(--surface-raised)',
      border: '1px solid var(--border-subtle)'
    },
    ai: {
      background: 'var(--ai-subtle)',
      border: '1px solid var(--ai-border)'
    },
    dashed: {
      background: 'transparent',
      border: '1px dashed var(--border-strong)'
    }
  }[tone];
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: interactive ? e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      e.currentTarget.style.borderColor = 'var(--teal-300)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    } : undefined,
    onMouseLeave: interactive ? e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      e.currentTarget.style.borderColor = 'var(--border-subtle)';
      e.currentTarget.style.transform = 'translateY(0)';
    } : undefined,
    style: {
      background: tones.background,
      border: tones.border,
      borderRadius: 'var(--radius-lg)',
      padding: pad,
      boxShadow: tone === 'dashed' ? 'none' : 'var(--shadow-sm)',
      cursor: interactive ? 'pointer' : 'default',
      transition: 'box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Square icon-only button. Always pass an accessible `label`. */
function IconButton({
  variant = 'ghost',
  size = 'md',
  label,
  active = false,
  disabled = false,
  style = {},
  children,
  ...rest
}) {
  const dim = {
    sm: '2rem',
    md: '2.5rem',
    lg: '2.75rem'
  }[size];
  const variants = {
    ghost: {
      background: active ? 'var(--surface-offset)' : 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
      hover: 'var(--surface-offset)'
    },
    outline: {
      background: 'var(--surface-card)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-default)',
      hover: 'var(--surface-offset)'
    },
    brand: {
      background: 'var(--brand-subtle)',
      color: 'var(--brand)',
      border: '1px solid transparent',
      hover: 'var(--teal-100)'
    }
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onMouseEnter: e => {
      if (!disabled) e.currentTarget.style.background = variants.hover;
    },
    onMouseLeave: e => {
      if (!disabled) e.currentTarget.style.background = variants.background;
    },
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: dim,
      height: dim,
      flexShrink: 0,
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transition: 'background var(--dur-fast) var(--ease-standard)',
      background: variants.background,
      color: variants.color,
      border: variants.border,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Text input. `code` styles it as a centered mono join-code field. */
function Input({
  label,
  hint,
  error,
  code = false,
  size = 'md',
  id,
  style = {},
  ...rest
}) {
  const inputId = id || (label ? `in-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const height = {
    sm: 'var(--control-sm)',
    md: 'var(--control-md)',
    lg: 'var(--control-lg)'
  }[size];
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
      width: '100%'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text-secondary)'
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      width: '100%',
      height: code ? '3.5rem' : height,
      padding: code ? '0 0.75rem' : '0 0.75rem',
      fontFamily: code ? 'var(--font-mono)' : 'var(--font-sans)',
      fontSize: code ? 'var(--text-2xl)' : 'var(--text-sm)',
      fontWeight: code ? 'var(--weight-bold)' : 'var(--weight-regular)',
      letterSpacing: code ? 'var(--tracking-code)' : 'normal',
      textAlign: code ? 'center' : 'left',
      color: 'var(--text-primary)',
      background: 'var(--surface-card)',
      border: `1px solid ${error ? 'var(--error)' : focused ? 'var(--ring-focus)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-sm)',
      boxShadow: focused ? `0 0 0 3px ${error ? 'var(--error-subtle)' : 'rgba(26,125,131,0.16)'}` : 'none',
      outline: 'none',
      transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
      ...style
    }
  }, rest)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      color: error ? 'var(--error)' : 'var(--text-muted)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Stat.jsx
try { (() => {
/** Headline metric for dashboards & analytics. Big tabular number + label. */
function Stat({
  value,
  label,
  sub,
  icon = null,
  tone = 'default',
  style = {}
}) {
  const accent = {
    default: 'var(--text-primary)',
    brand: 'var(--brand)',
    ai: 'var(--ai)'
  }[tone];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text-muted)'
    }
  }, label), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)',
      display: 'inline-flex'
    }
  }, icon)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-3xl)',
      fontWeight: 'var(--weight-bold)',
      lineHeight: 1,
      letterSpacing: 'var(--tracking-tight)',
      color: accent,
      fontVariantNumeric: 'tabular-nums'
    }
  }, value), sub && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)'
    }
  }, sub));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Stat.jsx", error: String((e && e.message) || e) }); }

// components/core/Switch.jsx
try { (() => {
/** Boolean toggle. Controlled via `checked` + `onChange(next)`. */
function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  size = 'md',
  id
}) {
  const dims = size === 'sm' ? {
    w: '2rem',
    h: '1.125rem',
    knob: '0.875rem',
    travel: '0.875rem'
  } : {
    w: '2.5rem',
    h: '1.5rem',
    knob: '1.125rem',
    travel: '1rem'
  };
  const switchId = id || (label ? `sw-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const toggle = () => {
    if (!disabled && onChange) onChange(!checked);
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: switchId,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.625rem',
      cursor: disabled ? 'not-allowed' : 'pointer'
    }
  }, /*#__PURE__*/React.createElement("button", {
    id: switchId,
    type: "button",
    role: "switch",
    "aria-checked": checked,
    disabled: disabled,
    onClick: toggle,
    style: {
      position: 'relative',
      width: dims.w,
      height: dims.h,
      flexShrink: 0,
      borderRadius: 'var(--radius-full)',
      border: 'none',
      padding: 0,
      background: checked ? 'var(--brand)' : 'var(--sand-400)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background var(--dur-base) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: '50%',
      left: '0.1875rem',
      width: dims.knob,
      height: dims.knob,
      borderRadius: '50%',
      background: 'var(--white)',
      boxShadow: 'var(--shadow-sm)',
      transform: `translateY(-50%) translateX(${checked ? dims.travel : '0'})`,
      transition: 'transform var(--dur-base) var(--ease-spring)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Switch.jsx", error: String((e && e.message) || e) }); }

// components/core/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Multi-line text input with optional label and character counter. */
function Textarea({
  label,
  hint,
  value,
  maxLength,
  rows = 4,
  id,
  style = {},
  onChange,
  ...rest
}) {
  const inputId = id || (label ? `ta-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const [focused, setFocused] = React.useState(false);
  const len = typeof value === 'string' ? value.length : 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
      width: '100%'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text-secondary)'
    }
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    id: inputId,
    rows: rows,
    value: value,
    maxLength: maxLength,
    onChange: onChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      width: '100%',
      padding: '0.625rem 0.75rem',
      resize: 'vertical',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      lineHeight: 'var(--leading-normal)',
      color: 'var(--text-primary)',
      background: 'var(--surface-card)',
      border: `1px solid ${focused ? 'var(--ring-focus)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-sm)',
      boxShadow: focused ? '0 0 0 3px rgba(26,125,131,0.16)' : 'none',
      outline: 'none',
      transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
      ...style
    }
  }, rest)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)'
    }
  }, hint), maxLength && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-faint)'
    }
  }, len, "/", maxLength)));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Textarea.jsx", error: String((e && e.message) || e) }); }

// ui_kits/host/host.jsx
try { (() => {
/* Pulse — Host UI kit screens. Composes design-system primitives from the bundle. */
const {
  Button,
  IconButton,
  Badge,
  Card,
  Input,
  Switch,
  Avatar,
  Stat,
  JoinCode,
  PollResult,
  ActivityTile,
  LeaderboardRow,
  QuestionCard,
  AIComposer,
  AISummaryCard,
  SuggestionChip,
  AIBadge,
  AISparkle
} = window.PulseDesignSystem_424f5e;
const Ic = ({
  n,
  s = 18,
  c = 'currentColor'
}) => {
  const d = window.lucide?.icons?.[n];
  return d ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: c
    },
    dangerouslySetInnerHTML: {
      __html: d.toSvg({
        width: s,
        height: s
      })
    }
  }) : null;
};

/* ---------------- Shell ---------------- */
function HostShell({
  nav,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      minHeight: '100%',
      background: 'var(--surface-canvas)'
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 232,
      flexShrink: 0,
      borderRight: '1px solid var(--border-subtle)',
      background: 'var(--surface-card)',
      padding: 'var(--space-5) var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/pulse-wordmark.svg",
    width: "120",
    alt: "Pulse"
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, [['home', 'Events', 'grid-2x2'], ['ai', 'AI Studio', 'sparkles'], ['analytics', 'Analytics', 'bar-chart-3'], ['settings', 'Settings', 'settings']].map(([k, label, icon]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    onClick: () => nav.go(k),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 10px',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      background: nav.at === k ? 'var(--brand-subtle)' : 'transparent',
      color: nav.at === k ? 'var(--brand-subtle-text)' : 'var(--text-secondary)',
      fontWeight: nav.at === k ? 600 : 500,
      fontSize: 'var(--text-sm)'
    }
  }, /*#__PURE__*/React.createElement(Ic, {
    n: icon,
    s: 17
  }), label, k === 'ai' && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto'
    }
  }, /*#__PURE__*/React.createElement(AIBadge, {
    label: "New"
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 6px'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Dana Owens",
    size: "md"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, "Dana Owens"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)'
    }
  }, "Pro workspace")))), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      minWidth: 0,
      overflow: 'auto'
    }
  }, children));
}
function TopBar({
  title,
  sub,
  actions
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
      padding: 'var(--space-8) var(--space-8) var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--text-2xl)'
    }
  }, title), sub && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 4,
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)'
    }
  }, sub)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, actions));
}

/* ---------------- Dashboard ---------------- */
const EVENTS = [{
  name: 'Q3 Company All-Hands',
  code: 'QZ7K2P',
  status: 'live',
  acts: 6,
  parts: 1284
}, {
  name: 'Product Onboarding 101',
  code: 'MX4T9A',
  status: 'scheduled',
  acts: 4,
  parts: 0
}, {
  name: 'Design Crit — Mobile',
  code: 'BK2W7C',
  status: 'draft',
  acts: 2,
  parts: 0
}, {
  name: 'Customer Advisory Board',
  code: 'LP8N3R',
  status: 'ended',
  acts: 9,
  parts: 342
}];
const STATUS = {
  live: ['live', 'Live'],
  scheduled: ['info', 'Scheduled'],
  draft: ['neutral', 'Draft'],
  ended: ['neutral', 'Ended']
};
function Dashboard({
  nav
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Events",
    sub: "Create an event, then share its code or QR with the room.",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic, {
        n: "sparkles",
        s: 16
      }),
      onClick: () => nav.go('ai')
    }, "AI Studio"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic, {
        n: "plus",
        s: 16
      }),
      onClick: () => nav.go('builder')
    }, "Create event"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 var(--space-8) var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      marginBottom: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: "12",
    label: "Active events",
    icon: /*#__PURE__*/React.createElement(Ic, {
      n: "radio",
      s: 16
    })
  })), /*#__PURE__*/React.createElement(Card, {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: "1,626",
    label: "Participants this week",
    tone: "brand",
    icon: /*#__PURE__*/React.createElement(Ic, {
      n: "users",
      s: 16
    })
  })), /*#__PURE__*/React.createElement(Card, {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: "94%",
    label: "Avg. participation",
    icon: /*#__PURE__*/React.createElement(Ic, {
      n: "activity",
      s: 16
    })
  })), /*#__PURE__*/React.createElement(Card, {
    tone: "ai",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: "38",
    label: "AI drafts used",
    tone: "ai",
    icon: /*#__PURE__*/React.createElement(AISparkle, {
      size: 16
    })
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    }
  }, EVENTS.map(e => /*#__PURE__*/React.createElement(Card, {
    key: e.code,
    interactive: true,
    padding: "md",
    onClick: () => nav.go('builder')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-lg)',
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, e.name), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)'
    }
  }, e.acts, " activities", e.parts > 0 ? ` · ${e.parts.toLocaleString()} joined` : '')), /*#__PURE__*/React.createElement(Badge, {
    tone: STATUS[e.status][0]
  }, STATUS[e.status][1])), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(JoinCode, {
    code: e.code,
    size: "sm"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    iconRight: /*#__PURE__*/React.createElement(Ic, {
      n: "arrow-right",
      s: 15
    })
  }, "Open")))))));
}

/* ---------------- AI Studio ---------------- */
const DRAFTED = [{
  type: 'poll',
  icon: 'bar-chart-3',
  title: 'How are you feeling about Q3 so far?',
  meta: 'Rating · 1–5'
}, {
  type: 'wordcloud',
  icon: 'cloud',
  title: 'One word for our biggest win this quarter',
  meta: 'Word cloud'
}, {
  type: 'quiz',
  icon: 'trophy',
  title: 'Quick quiz: our new product names',
  meta: 'Quiz · 3 questions'
}, {
  type: 'qa',
  icon: 'messages-square',
  title: 'Open Q&A with the leadership team',
  meta: 'Q&A · moderated'
}];
function AIStudio({
  nav
}) {
  const [prompt, setPrompt] = React.useState('Kick off our Q3 all-hands for 1,200 people — warm up the room, take the pulse on morale, then open Q&A.');
  const [generated, setGenerated] = React.useState(true);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10
      }
    }, "AI Studio ", /*#__PURE__*/React.createElement(AIBadge, {
      label: "Beta",
      gradient: true
    })),
    sub: "Describe your session. Pulse drafts a runnable agenda you can edit."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 var(--space-8) var(--space-8)',
      maxWidth: 760
    }
  }, /*#__PURE__*/React.createElement(AIComposer, {
    value: prompt,
    onChange: setPrompt,
    onGenerate: () => setGenerated(true),
    suggestions: ['Icebreaker for 50 new hires', 'Sprint retro: start / stop / continue', '5-question product trivia']
  }), generated && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(AISparkle, {
    size: 16,
    color: "var(--ai)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--text-secondary)'
    }
  }, "Drafted agenda \xB7 4 activities"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ai",
    size: "sm",
    iconLeft: /*#__PURE__*/React.createElement(Ic, {
      n: "check",
      s: 15
    }),
    onClick: () => nav.go('builder')
  }, "Add all to event"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, DRAFTED.map((d, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    padding: "sm",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 38,
      height: 38,
      borderRadius: 'var(--radius-md)',
      background: 'var(--ai-subtle)',
      color: 'var(--ai)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Ic, {
    n: d.icon,
    s: 18
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-base)',
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, d.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, d.meta)), /*#__PURE__*/React.createElement(Badge, {
    tone: "ai",
    size: "sm"
  }, "AI"), /*#__PURE__*/React.createElement(IconButton, {
    label: "Edit",
    variant: "ghost"
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "pencil",
    s: 16
  }))))))));
}

/* ---------------- Builder + Run ---------------- */
const ACTIVITY_PALETTE = [['poll', 'bar-chart-3', 'Poll', 'Single, multiple, rating, open'], ['quiz', 'trophy', 'Quiz', 'Timed, scored, leaderboard'], ['wordcloud', 'cloud', 'Word cloud', 'Live weighted cloud'], ['qa', 'messages-square', 'Q&A', 'Moderated, upvoted'], ['feedback', 'star', 'Feedback', 'Rating + open text']];
function Builder({
  nav
}) {
  const [running, setRunning] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Q3 Company All-Hands",
    sub: /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: running ? 'live' : 'neutral'
    }, running ? 'Live now' : 'Draft'), " \xB7 6 activities"),
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic, {
        n: "monitor",
        s: 16
      })
    }, "Present"), running ? /*#__PURE__*/React.createElement(Button, {
      variant: "danger",
      iconLeft: /*#__PURE__*/React.createElement(Ic, {
        n: "square",
        s: 15
      }),
      onClick: () => setRunning(false)
    }, "End event") : /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic, {
        n: "play",
        s: 15
      }),
      onClick: () => setRunning(true)
    }, "Go live"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 320px',
      gap: 'var(--space-6)',
      padding: '0 var(--space-8) var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("div", null, running ? /*#__PURE__*/React.createElement(RunPanel, null) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--text-secondary)',
      marginBottom: 12
    }
  }, "Add an activity"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 12,
      marginBottom: 'var(--space-8)'
    }
  }, ACTIVITY_PALETTE.map(([t, icon, title, desc]) => /*#__PURE__*/React.createElement(ActivityTile, {
    key: t,
    type: t,
    icon: /*#__PURE__*/React.createElement(Ic, {
      n: icon,
      s: 20
    }),
    title: title,
    description: desc
  })), /*#__PURE__*/React.createElement(ActivityTile, {
    type: "ai",
    icon: /*#__PURE__*/React.createElement(AISparkle, {
      size: 20
    }),
    title: "Draft with AI",
    description: "Describe it, get activities",
    onClick: () => nav.go('ai')
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "md"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      color: 'var(--text-faint)',
      marginBottom: 10
    }
  }, "Join"), /*#__PURE__*/React.createElement(JoinCode, {
    code: "QZ7K2P",
    size: "md",
    onCopy: () => {}
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-sunken)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-faint)'
    }
  }, /*#__PURE__*/React.createElement(Ic, {
    n: "qr-code",
    s: 36
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)'
    }
  }, "pulse.live/QZ7K2P"))), /*#__PURE__*/React.createElement(Card, {
    tone: "ai",
    padding: "md"
  }, /*#__PURE__*/React.createElement(SuggestionChip, {
    text: "Add a follow-up poll on remote work",
    onAccept: () => {},
    onDismiss: () => {},
    style: {
      background: 'var(--surface-card)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 10
    }
  }), /*#__PURE__*/React.createElement(SuggestionChip, {
    text: "Shorten quiz to 3 questions",
    onAccept: () => {},
    onDismiss: () => {},
    style: {
      background: 'var(--surface-card)'
    }
  })))));
}
function RunPanel() {
  return /*#__PURE__*/React.createElement(Card, {
    padding: "md"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "brand",
    dot: true
  }, "Poll \xB7 live"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-lg)',
      fontWeight: 600
    }
  }, "How are you feeling about Q3?")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm"
  }, "Close poll"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    iconRight: /*#__PURE__*/React.createElement(Ic, {
      n: "skip-forward",
      s: 14
    })
  }, "Next"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(PollResult, {
    label: "Energized",
    count: 612,
    total: 1284,
    index: 0,
    leading: true
  }), /*#__PURE__*/React.createElement(PollResult, {
    label: "Optimistic",
    count: 398,
    total: 1284,
    index: 1
  }), /*#__PURE__*/React.createElement(PollResult, {
    label: "Steady",
    count: 214,
    total: 1284,
    index: 2
  }), /*#__PURE__*/React.createElement(PollResult, {
    label: "Stretched",
    count: 60,
    total: 1284,
    index: 3
  })), /*#__PURE__*/React.createElement(AISummaryCard, {
    title: "Live read",
    body: "Sentiment skews positive \u2014 \u201Cenergized\u201D and \u201Coptimistic\u201D lead 79% of the room. A small but vocal \u201Cstretched\u201D cluster mentions workload.",
    footnote: "Updated from 1,284 live responses"
  }));
}

/* ---------------- Analytics ---------------- */
function Analytics() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TopBar, {
    title: "Q3 All-Hands \u2014 Analytics",
    sub: "Generated just now \xB7 1,284 participants",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "md",
      iconLeft: /*#__PURE__*/React.createElement(Ic, {
        n: "download",
        s: 15
      })
    }, "CSV"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "md",
      iconLeft: /*#__PURE__*/React.createElement(Ic, {
        n: "download",
        s: 15
      })
    }, "PDF"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 var(--space-8) var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      marginBottom: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: "1,284",
    label: "Participants",
    icon: /*#__PURE__*/React.createElement(Ic, {
      n: "users",
      s: 16
    })
  })), /*#__PURE__*/React.createElement(Card, {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: "94%",
    label: "Participation rate",
    sub: "1,207 of 1,284 responded",
    tone: "brand"
  })), /*#__PURE__*/React.createElement(Card, {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: "5,902",
    label: "Total responses"
  })), /*#__PURE__*/React.createElement(Card, {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: "38",
    label: "Questions asked",
    sub: "29 answered"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "md"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      marginBottom: 14
    }
  }, "Poll \xB7 How are you feeling about Q3?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(PollResult, {
    label: "Energized",
    count: 612,
    total: 1284,
    index: 0,
    leading: true
  }), /*#__PURE__*/React.createElement(PollResult, {
    label: "Optimistic",
    count: 398,
    total: 1284,
    index: 1
  }), /*#__PURE__*/React.createElement(PollResult, {
    label: "Steady",
    count: 214,
    total: 1284,
    index: 2
  }), /*#__PURE__*/React.createElement(PollResult, {
    label: "Stretched",
    count: 60,
    total: 1284,
    index: 3
  }))), /*#__PURE__*/React.createElement(AISummaryCard, {
    title: "Executive summary",
    body: "Morale is strong heading into Q3. Open responses and Q&A converge on two themes.",
    themes: [{
      label: 'Excitement for the new launch',
      count: 214
    }, {
      label: 'Concern about workload & hiring',
      count: 96
    }, {
      label: 'Requests for clearer roadmap',
      count: 71
    }],
    footnote: "Summarized from 5,902 responses across 6 activities"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "md"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      marginBottom: 12
    }
  }, "Quiz leaderboard"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(LeaderboardRow, {
    rank: 1,
    name: "Mara Lee",
    points: 2840
  }), /*#__PURE__*/React.createElement(LeaderboardRow, {
    rank: 2,
    name: "Alex Rivera",
    points: 2710
  }), /*#__PURE__*/React.createElement(LeaderboardRow, {
    rank: 3,
    name: "Sam Cho",
    points: 2480
  }))), /*#__PURE__*/React.createElement(Card, {
    padding: "md"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      marginBottom: 12
    }
  }, "Top questions"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(QuestionCard, {
    text: "Will headcount keep pace with the roadmap?",
    author: "Anonymous",
    votes: 68,
    answered: true
  }), /*#__PURE__*/React.createElement(QuestionCard, {
    text: "Any update on the hybrid work policy?",
    author: "Priya N.",
    votes: 41
  }))))));
}
function HostApp() {
  const [at, setAt] = React.useState('home');
  const nav = {
    at,
    go: setAt
  };
  const navFor = ['home', 'ai', 'analytics', 'settings'].includes(at) ? at : 'home';
  return /*#__PURE__*/React.createElement(HostShell, {
    nav: {
      at: navFor,
      go: setAt
    }
  }, at === 'home' && /*#__PURE__*/React.createElement(Dashboard, {
    nav: nav
  }), at === 'ai' && /*#__PURE__*/React.createElement(AIStudio, {
    nav: nav
  }), at === 'builder' && /*#__PURE__*/React.createElement(Builder, {
    nav: nav
  }), at === 'analytics' && /*#__PURE__*/React.createElement(Analytics, null), at === 'settings' && /*#__PURE__*/React.createElement(Analytics, null));
}
window.HostApp = HostApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/host/host.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/marketing.jsx
try { (() => {
/* Pulse — Marketing landing UI kit. Recreated from apps/web/src/app/page.tsx, restyled + AI angle. */
const {
  Button,
  Card,
  Badge,
  AIBadge,
  AISparkle,
  JoinCode
} = window.PulseDesignSystem_424f5e;
const Ic = ({
  n,
  s = 20,
  c = 'currentColor'
}) => {
  const d = window.lucide?.icons?.[n];
  return d ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: c
    },
    dangerouslySetInnerHTML: {
      __html: d.toSvg({
        width: s,
        height: s
      })
    }
  }) : null;
};
const FEATURES = [['bar-chart-3', 'Live polls', 'Single, multiple, rating, and open text. Results animate in as votes land.'], ['messages-square', 'Anonymous Q&A', 'Audiences ask and upvote. Moderate and mark answered from one queue.'], ['trophy', 'Interactive quizzes', 'Timed questions, points, and a live leaderboard that keeps the room competitive.'], ['cloud', 'Word clouds', 'Collect words on any prompt and watch a weighted cloud grow on the big screen.'], ['star', 'Feedback forms', 'Rating and open-text feedback, captured live and exportable.'], ['line-chart', 'Analytics & reports', 'Participation, engagement timelines, per-activity breakdowns. CSV & PDF.']];
const STATS = [['<1s', 'Broadcast latency'], ['5,000+', 'Live participants / event'], ['No login', 'For participants'], ['CSV / PDF', 'Session reports']];
const STEPS = [['zap', 'Create or generate', 'Build activities by hand — or describe your session and let Pulse AI draft them.'], ['qr-code', 'Share the code', 'Participants join instantly from any device. No app, no account.'], ['users', 'Engage live', 'Launch activities and watch responses sync to the room in under a second.']];
function Nav() {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'color-mix(in srgb, var(--surface-canvas) 80%, transparent)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1120,
      margin: '0 auto',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/pulse-wordmark.svg",
    width: "120",
    alt: "Pulse"
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 30
    }
  }, ['Features', 'How it works', 'Pricing'].map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      color: 'var(--text-muted)',
      textDecoration: 'none'
    }
  }, l))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "md"
  }, "Log in"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md"
  }, "Start free"))));
}
function Section({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 1120,
      margin: '0 auto',
      padding: '88px 24px',
      ...style
    }
  }, children);
}
function MarketingApp() {
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "Marketing",
    style: {
      background: 'var(--surface-canvas)'
    }
  }, /*#__PURE__*/React.createElement(Nav, null), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(180deg, var(--teal-50) 0%, var(--surface-canvas) 60%)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(Section, {
    style: {
      textAlign: 'center',
      paddingTop: 80,
      paddingBottom: 88
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "ai",
    size: "md"
  }, /*#__PURE__*/React.createElement(AISparkle, {
    size: 13
  }), " \xA0Now with Pulse AI")), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--text-5xl)',
      maxWidth: 760,
      margin: '0 auto',
      lineHeight: 1.05
    }
  }, "Turn any audience into a conversation"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-lg)',
      color: 'var(--text-muted)',
      maxWidth: 560,
      margin: '22px auto 0',
      lineHeight: 1.55
    }
  }, "Live polls, Q&A, quizzes, and word clouds for meetings, webinars, and classrooms. Describe your session \u2014 Pulse AI drafts it. Participants join with a code. No app, no login."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'center',
      marginTop: 30
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "xl",
    iconRight: /*#__PURE__*/React.createElement(Ic, {
      n: "arrow-right",
      s: 18
    })
  }, "Start free"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "xl"
  }, "Watch a demo")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-faint)',
      marginTop: 16
    }
  }, "No credit card required \xB7 Email or Google sign-up"))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--surface-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1120,
      margin: '0 auto',
      padding: '40px 24px',
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 24
    }
  }, STATS.map(([v, l]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-3xl)',
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      marginTop: 4
    }
  }, l))))), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(Card, {
    tone: "ai",
    padding: "lg",
    style: {
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      gap: 40,
      alignItems: 'center',
      borderRadius: 'var(--radius-2xl)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(AIBadge, {
    label: "Pulse AI",
    gradient: true
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--text-3xl)',
      margin: '16px 0 12px'
    }
  }, "Describe it. Pulse drafts it."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-base)',
      color: 'var(--text-secondary)',
      lineHeight: 1.6,
      marginBottom: 20
    }
  }, "Type \u201Csprint retro for 12 people\u201D and get a runnable agenda \u2014 polls, a word cloud, and Q&A \u2014 in seconds. After the session, AI summarizes every open response and clusters your Q&A into themes."), /*#__PURE__*/React.createElement(Button, {
    variant: "ai",
    size: "lg",
    iconLeft: /*#__PURE__*/React.createElement(AISparkle, {
      size: 16
    })
  }, "Try the AI builder")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--ai-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      color: 'var(--ai)',
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(AISparkle, {
    size: 18
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)'
    }
  }, "Kick off our Q3 all-hands \u2014 warm up the room, take the pulse on morale, then open Q&A.")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-subtle)',
      margin: '16px 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, [['bar-chart-3', 'Poll · How are you feeling about Q3?'], ['cloud', 'Word cloud · One word for our biggest win'], ['messages-square', 'Q&A · Open questions for leadership']].map(([ic, t]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 11px',
      background: 'var(--ai-subtle)',
      borderRadius: 'var(--radius-md)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-primary)',
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ai)'
    }
  }, /*#__PURE__*/React.createElement(Ic, {
    n: ic,
    s: 16
  })), t)))))), /*#__PURE__*/React.createElement(Section, {
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      maxWidth: 560,
      margin: '0 auto 48px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--text-3xl)'
    }
  }, "Everything you need to engage live"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-base)',
      color: 'var(--text-muted)',
      marginTop: 12
    }
  }, "One platform for every interactive moment \u2014 built for the big screen and every phone in the room.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 16
    }
  }, FEATURES.map(([icon, title, body]) => /*#__PURE__*/React.createElement(Card, {
    key: title,
    padding: "md"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 42,
      height: 42,
      borderRadius: 'var(--radius-md)',
      background: 'var(--brand-subtle)',
      color: 'var(--brand)'
    }
  }, /*#__PURE__*/React.createElement(Ic, {
    n: icon,
    s: 20
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--text-lg)',
      margin: '14px 0 6px'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      lineHeight: 1.55
    }
  }, body))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--text-3xl)'
    }
  }, "Live in three steps")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 32
    }
  }, STEPS.map(([icon, title, body], i) => /*#__PURE__*/React.createElement("div", {
    key: title,
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 52,
      height: 52,
      borderRadius: 'var(--radius-full)',
      background: 'var(--brand)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement(Ic, {
    n: icon,
    s: 22
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--brand)',
      marginTop: 12,
      letterSpacing: '.04em'
    }
  }, "STEP ", i + 1), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--text-lg)',
      margin: '6px 0 8px'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      maxWidth: 260,
      margin: '0 auto',
      lineHeight: 1.55
    }
  }, body)))))), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--teal-900)',
      borderRadius: 'var(--radius-2xl)',
      padding: '72px 32px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--text-4xl)',
      color: 'var(--text-on-dark)'
    }
  }, "Ready to make your next session interactive?"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-lg)',
      color: 'var(--teal-300)',
      maxWidth: 520,
      margin: '16px auto 0'
    }
  }, "Create your first event in minutes. Your audience just needs a code."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 18,
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "xl",
    iconRight: /*#__PURE__*/React.createElement(Ic, {
      n: "arrow-right",
      s: 18
    })
  }, "Start free"), /*#__PURE__*/React.createElement(JoinCode, {
    code: "QZ7K2P",
    size: "md",
    inverse: true
  })))), /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: '1px solid var(--border-subtle)',
      padding: '32px 24px',
      textAlign: 'center',
      color: 'var(--text-faint)',
      fontSize: 'var(--text-sm)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/pulse-wordmark.svg",
    width: "92",
    alt: "Pulse",
    style: {
      opacity: 0.6,
      marginBottom: 10
    }
  }), /*#__PURE__*/React.createElement("br", null), "\xA9 2026 Pulse \xB7 Real-time audience engagement"));
}
window.MarketingApp = MarketingApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/marketing.jsx", error: String((e && e.message) || e) }); }

// ui_kits/participant/participant.jsx
try { (() => {
/* Pulse — Participant UI kit. Phone-framed live voting + Q&A. */
const {
  Button,
  Badge,
  Input,
  Avatar,
  JoinCode,
  PollResult,
  QuestionCard,
  Textarea,
  AIBadge
} = window.PulseDesignSystem_424f5e;
const Ic = ({
  n,
  s = 18,
  c = 'currentColor'
}) => {
  const d = window.lucide?.icons?.[n];
  return d ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: c
    },
    dangerouslySetInnerHTML: {
      __html: d.toSvg({
        width: s,
        height: s
      })
    }
  }) : null;
};
function Phone({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 390,
      height: 760,
      background: '#0c0c0e',
      borderRadius: 46,
      padding: 11,
      boxShadow: 'var(--shadow-xl)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      height: '100%',
      background: 'var(--surface-canvas)',
      borderRadius: 36,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 9,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 108,
      height: 26,
      background: '#0c0c0e',
      borderRadius: 14,
      zIndex: 5
    }
  }), children));
}
function Header({
  code,
  name
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '38px 18px 12px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--surface-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/pulse-logomark.svg",
    width: "24",
    height: "24",
    alt: ""
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      letterSpacing: '.18em',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)'
    }
  }, code)), name && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: name,
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)'
    }
  }, name.split(' ')[0])));
}

/* Join */
function JoinScreen({
  go
}) {
  const [code, setCode] = React.useState('QZ7K2P');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 26px',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 14,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/pulse-logomark.svg",
    width: "52",
    height: "52",
    alt: "Pulse"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--text-xl)'
    }
  }, "Join the session"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 6,
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)'
    }
  }, "Enter the code on screen."))), /*#__PURE__*/React.createElement(Input, {
    code: true,
    value: code,
    maxLength: 6,
    onChange: e => setCode(e.target.value.toUpperCase())
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    block: true,
    onClick: () => go('name')
  }, "Continue"), /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-faint)'
    }
  }, "No app \xB7 no login"));
}
function NameScreen({
  go
}) {
  const [name, setName] = React.useState('');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 26px',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--text-xl)'
    }
  }, "Joining QZ7K2P"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      marginTop: -8
    }
  }, "Add your name, or join anonymously."), /*#__PURE__*/React.createElement(Input, {
    label: "Your name (optional)",
    placeholder: "e.g. Alex",
    value: name,
    onChange: e => setName(e.target.value)
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    block: true,
    onClick: () => go('poll', name || 'You')
  }, "Join event"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "md",
    block: true,
    onClick: () => go('poll', '')
  }, "Join anonymously"));
}

/* Live poll vote */
function PollVote({
  go,
  name
}) {
  const opts = ['Energized', 'Optimistic', 'Steady', 'Stretched'];
  const [sel, setSel] = React.useState(null);
  const [done, setDone] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(Header, {
    code: "QZ7K2P",
    name: name
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "brand",
    dot: true
  }, "Live poll")), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--text-lg)'
    }
  }, "How are you feeling about Q3?"), !done ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o,
    onClick: () => setSel(o),
    style: {
      textAlign: 'left',
      padding: '14px 16px',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      fontSize: 'var(--text-base)',
      fontWeight: 500,
      fontFamily: 'var(--font-sans)',
      background: sel === o ? 'var(--brand-subtle)' : 'var(--surface-card)',
      border: `1.5px solid ${sel === o ? 'var(--brand)' : 'var(--border-default)'}`,
      color: 'var(--text-primary)'
    }
  }, o))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    block: true,
    disabled: !sel,
    onClick: () => setDone(true)
  }, "Submit")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Badge, {
    tone: "success",
    dot: true
  }, "Response submitted"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(PollResult, {
    label: "Energized",
    count: 612,
    total: 1284,
    index: 0,
    leading: true
  }), /*#__PURE__*/React.createElement(PollResult, {
    label: "Optimistic",
    count: 398,
    total: 1284,
    index: 1
  }), /*#__PURE__*/React.createElement(PollResult, {
    label: "Steady",
    count: 214,
    total: 1284,
    index: 2
  }), /*#__PURE__*/React.createElement(PollResult, {
    label: "Stretched",
    count: 60,
    total: 1284,
    index: 3
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "md",
    block: true,
    onClick: () => go('qa', name),
    iconRight: /*#__PURE__*/React.createElement(Ic, {
      n: "arrow-right",
      s: 15
    })
  }, "Go to Q&A"))));
}

/* Q&A */
function QaScreen({
  name
}) {
  const [text, setText] = React.useState('');
  const [qs, setQs] = React.useState([{
    id: 1,
    text: 'Will headcount keep pace with the roadmap?',
    author: 'Anonymous',
    votes: 68,
    voted: false
  }, {
    id: 2,
    text: 'Any update on the hybrid work policy?',
    author: 'Priya N.',
    votes: 41,
    voted: true
  }, {
    id: 3,
    text: 'When does the new launch ship to EU?',
    author: 'Marco',
    votes: 22,
    voted: false
  }]);
  const vote = id => setQs(p => p.map(q => q.id === id ? {
    ...q,
    voted: !q.voted,
    votes: q.votes + (q.voted ? -1 : 1)
  } : q));
  const ask = () => {
    if (!text.trim()) return;
    setQs(p => [{
      id: Date.now(),
      text,
      author: name || 'You',
      votes: 1,
      voted: true
    }, ...p]);
    setText('');
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(Header, {
    code: "QZ7K2P",
    name: name
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--text-lg)'
    }
  }, "Q&A"), /*#__PURE__*/React.createElement(Textarea, {
    label: "Ask the room",
    value: text,
    onChange: e => setText(e.target.value),
    maxLength: 300,
    rows: 3,
    placeholder: "Type your question\u2026"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md",
    block: true,
    disabled: !text.trim(),
    onClick: ask
  }, "Submit question"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      letterSpacing: '.05em',
      textTransform: 'uppercase',
      color: 'var(--text-faint)'
    }
  }, "Top questions"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto'
    }
  }, /*#__PURE__*/React.createElement(AIBadge, {
    label: "AI sorted"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, [...qs].sort((a, b) => b.votes - a.votes).map(q => /*#__PURE__*/React.createElement(QuestionCard, {
    key: q.id,
    text: q.text,
    author: q.author,
    votes: q.votes,
    voted: q.voted,
    onUpvote: () => vote(q.id)
  })))));
}
function ParticipantApp() {
  const [screen, setScreen] = React.useState('join');
  const [name, setName] = React.useState('');
  const go = (s, n) => {
    if (n !== undefined) setName(n);
    setScreen(s);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 36,
      padding: 40,
      background: 'var(--surface-canvas)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Phone, null, /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "Participant",
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, screen === 'join' && /*#__PURE__*/React.createElement(JoinScreen, {
    go: go
  }), screen === 'name' && /*#__PURE__*/React.createElement(NameScreen, {
    go: go
  }), screen === 'poll' && /*#__PURE__*/React.createElement(PollVote, {
    go: go,
    name: name
  }), screen === 'qa' && /*#__PURE__*/React.createElement(QaScreen, {
    name: name
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 240,
      color: 'var(--text-muted)',
      fontSize: 'var(--text-sm)',
      lineHeight: 1.6
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/pulse-wordmark.svg",
    width: "120",
    alt: "Pulse",
    style: {
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, "Participant view."), " Tap through: enter code \u2192 name \u2192 vote on a live poll \u2192 ask & upvote in Q&A. No app, no login.")));
}
window.ParticipantApp = ParticipantApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/participant/participant.jsx", error: String((e && e.message) || e) }); }

// ui_kits/projector/projector.jsx
try { (() => {
/* Pulse — Projector UI kit. Big-screen live stage (dark, inverse). */
const {
  Badge,
  JoinCode,
  PollResult,
  LeaderboardRow,
  AISparkle
} = window.PulseDesignSystem_424f5e;
const Ic = ({
  n,
  s = 18,
  c = 'currentColor'
}) => {
  const d = window.lucide?.icons?.[n];
  return d ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: c
    },
    dangerouslySetInnerHTML: {
      __html: d.toSvg({
        width: s,
        height: s
      })
    }
  }) : null;
};
const SCENES = ['poll', 'wordcloud', 'leaderboard'];
const WORDS = [['launch', 1], ['momentum', 0.85], ['focus', 0.8], ['growth', 0.72], ['ship', 0.68], ['customers', 0.6], ['hiring', 0.55], ['quality', 0.5], ['speed', 0.46], ['clarity', 0.42], ['trust', 0.38], ['design', 0.34], ['scale', 0.3], ['craft', 0.27], ['energy', 0.24]];
const WC_COLORS = ['var(--data-2)', 'var(--data-3)', 'var(--data-4)', 'var(--teal-300)', 'var(--data-7)', '#cfe0df'];
function StageHeader() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/pulse-wordmark-dark.svg",
    width: "150",
    alt: "Pulse"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "live"
  }, "Live"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)',
      letterSpacing: '.1em',
      textTransform: 'uppercase'
    }
  }, "Join at pulse.live"), /*#__PURE__*/React.createElement(JoinCode, {
    code: "QZ7K2P",
    size: "md",
    inverse: true
  }))));
}
function CountBanner() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-6xl)',
      fontWeight: 700,
      lineHeight: 1,
      color: 'var(--text-on-dark)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, "1,284"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xl)',
      color: 'var(--text-muted)',
      marginTop: 8
    }
  }, "participants joined"));
}
function PollScene() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 1100,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      letterSpacing: '.12em',
      textTransform: 'uppercase',
      color: 'var(--teal-300)'
    }
  }, "Live poll"), /*#__PURE__*/React.createElement("h1", {
    style: {
      textAlign: 'center',
      fontSize: 'var(--text-5xl)',
      color: 'var(--text-on-dark)',
      margin: '12px 0 40px'
    }
  }, "How are you feeling about Q3?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 26
    }
  }, [['Energized', 612, 0, true], ['Optimistic', 398, 1], ['Steady', 214, 2], ['Stretched', 60, 3]].map(([l, c, i, lead]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      fontSize: 22
    }
  }, /*#__PURE__*/React.createElement(PollResult, {
    label: l,
    count: c,
    total: 1284,
    index: i,
    leading: lead,
    inverse: true,
    style: {
      '--scale': 1
    }
  })))));
}
function WordCloudScene() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 1100,
      margin: '0 auto',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      letterSpacing: '.12em',
      textTransform: 'uppercase',
      color: 'var(--data-7)'
    }
  }, "Word cloud"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--text-4xl)',
      color: 'var(--text-on-dark)',
      margin: '12px 0 36px'
    }
  }, "One word for our biggest win"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px 28px',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 1.1
    }
  }, WORDS.map(([w, wt], i) => /*#__PURE__*/React.createElement("span", {
    key: w,
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: wt > 0.6 ? 700 : 600,
      fontSize: `${1.1 + wt * 3.4}rem`,
      color: WC_COLORS[i % WC_COLORS.length],
      opacity: 0.55 + wt * 0.45
    }
  }, w))));
}
function LeaderboardScene() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 760,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      letterSpacing: '.12em',
      textTransform: 'uppercase',
      color: 'var(--data-4)'
    }
  }, "Quiz leaderboard"), /*#__PURE__*/React.createElement("h1", {
    style: {
      textAlign: 'center',
      fontSize: 'var(--text-4xl)',
      color: 'var(--text-on-dark)',
      margin: '12px 0 32px'
    }
  }, "Top of the room"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      fontSize: 20
    }
  }, /*#__PURE__*/React.createElement(LeaderboardRow, {
    rank: 1,
    name: "Mara Lee",
    points: 2840,
    inverse: true
  }), /*#__PURE__*/React.createElement(LeaderboardRow, {
    rank: 2,
    name: "Alex Rivera",
    points: 2710,
    inverse: true
  }), /*#__PURE__*/React.createElement(LeaderboardRow, {
    rank: 3,
    name: "Sam Cho",
    points: 2480,
    inverse: true
  }), /*#__PURE__*/React.createElement(LeaderboardRow, {
    rank: 4,
    name: "Priya Nair",
    points: 2210,
    inverse: true
  }), /*#__PURE__*/React.createElement(LeaderboardRow, {
    rank: 5,
    name: "Tom Becker",
    points: 1980,
    inverse: true
  })));
}
function ProjectorApp() {
  const [i, setI] = React.useState(0);
  const scene = SCENES[i];
  return /*#__PURE__*/React.createElement("div", {
    className: "pulse-stage",
    "data-screen-label": "Projector",
    style: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '48px 56px',
      gap: 40
    }
  }, /*#__PURE__*/React.createElement(StageHeader, null), /*#__PURE__*/React.createElement(CountBanner, null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center'
    }
  }, scene === 'poll' && /*#__PURE__*/React.createElement(PollScene, null), scene === 'wordcloud' && /*#__PURE__*/React.createElement(WordCloudScene, null), scene === 'leaderboard' && /*#__PURE__*/React.createElement(LeaderboardScene, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14
    }
  }, SCENES.map((s, idx) => /*#__PURE__*/React.createElement("button", {
    key: s,
    onClick: () => setI(idx),
    "aria-label": s,
    style: {
      width: idx === i ? 30 : 10,
      height: 10,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: idx === i ? 'var(--teal-300)' : 'var(--border-strong)',
      transition: 'all var(--dur-base) var(--ease-standard)'
    }
  }))));
}
window.ProjectorApp = ProjectorApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/projector/projector.jsx", error: String((e && e.message) || e) }); }

__ds_ns.ActivityTile = __ds_scope.ActivityTile;

__ds_ns.JoinCode = __ds_scope.JoinCode;

__ds_ns.LeaderboardRow = __ds_scope.LeaderboardRow;

__ds_ns.LiveDot = __ds_scope.LiveDot;

__ds_ns.PollResult = __ds_scope.PollResult;

__ds_ns.QuestionCard = __ds_scope.QuestionCard;

__ds_ns.AISparkle = __ds_scope.AISparkle;

__ds_ns.AIBadge = __ds_scope.AIBadge;

__ds_ns.AIComposer = __ds_scope.AIComposer;

__ds_ns.AISummaryCard = __ds_scope.AISummaryCard;

__ds_ns.SuggestionChip = __ds_scope.SuggestionChip;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

})();

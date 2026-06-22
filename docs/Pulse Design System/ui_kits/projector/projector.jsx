/* Pulse — Projector UI kit. Big-screen live stage (dark, inverse). */
const { Badge, JoinCode, PollResult, LeaderboardRow, AISparkle } = window.PulseDesignSystem_424f5e;

const Ic = ({ n, s = 18, c = 'currentColor' }) => {
  const d = window.lucide?.icons?.[n];
  return d ? <span style={{ display: 'inline-flex', color: c }} dangerouslySetInnerHTML={{ __html: d.toSvg({ width: s, height: s }) }} /> : null;
};

const SCENES = ['poll', 'wordcloud', 'leaderboard'];
const WORDS = [
  ['launch', 1], ['momentum', 0.85], ['focus', 0.8], ['growth', 0.72], ['ship', 0.68],
  ['customers', 0.6], ['hiring', 0.55], ['quality', 0.5], ['speed', 0.46], ['clarity', 0.42],
  ['trust', 0.38], ['design', 0.34], ['scale', 0.3], ['craft', 0.27], ['energy', 0.24],
];
const WC_COLORS = ['var(--data-2)', 'var(--data-3)', 'var(--data-4)', 'var(--teal-300)', 'var(--data-7)', '#cfe0df'];

function StageHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <img src="../../assets/pulse-wordmark-dark.svg" width="150" alt="Pulse" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Badge tone="live">Live</Badge>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Join at pulse.live</div>
          <JoinCode code="QZ7K2P" size="md" inverse />
        </div>
      </div>
    </div>
  );
}

function CountBanner() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-6xl)', fontWeight: 700, lineHeight: 1, color: 'var(--text-on-dark)', fontVariantNumeric: 'tabular-nums' }}>1,284</div>
      <div style={{ fontSize: 'var(--text-xl)', color: 'var(--text-muted)', marginTop: 8 }}>participants joined</div>
    </div>
  );
}

function PollScene() {
  return (
    <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}>
      <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--teal-300)' }}>Live poll</p>
      <h1 style={{ textAlign: 'center', fontSize: 'var(--text-5xl)', color: 'var(--text-on-dark)', margin: '12px 0 40px' }}>How are you feeling about Q3?</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        {[['Energized', 612, 0, true], ['Optimistic', 398, 1], ['Steady', 214, 2], ['Stretched', 60, 3]].map(([l, c, i, lead]) => (
          <div key={l} style={{ fontSize: 22 }}>
            <PollResult label={l} count={c} total={1284} index={i} leading={lead} inverse style={{ '--scale': 1 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function WordCloudScene() {
  return (
    <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--data-7)' }}>Word cloud</p>
      <h1 style={{ fontSize: 'var(--text-4xl)', color: 'var(--text-on-dark)', margin: '12px 0 36px' }}>One word for our biggest win</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 28px', alignItems: 'center', justifyContent: 'center', lineHeight: 1.1 }}>
        {WORDS.map(([w, wt], i) => (
          <span key={w} style={{
            fontFamily: 'var(--font-display)', fontWeight: wt > 0.6 ? 700 : 600,
            fontSize: `${1.1 + wt * 3.4}rem`, color: WC_COLORS[i % WC_COLORS.length],
            opacity: 0.55 + wt * 0.45,
          }}>{w}</span>
        ))}
      </div>
    </div>
  );
}

function LeaderboardScene() {
  return (
    <div style={{ width: '100%', maxWidth: 760, margin: '0 auto' }}>
      <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--data-4)' }}>Quiz leaderboard</p>
      <h1 style={{ textAlign: 'center', fontSize: 'var(--text-4xl)', color: 'var(--text-on-dark)', margin: '12px 0 32px' }}>Top of the room</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 20 }}>
        <LeaderboardRow rank={1} name="Mara Lee" points={2840} inverse />
        <LeaderboardRow rank={2} name="Alex Rivera" points={2710} inverse />
        <LeaderboardRow rank={3} name="Sam Cho" points={2480} inverse />
        <LeaderboardRow rank={4} name="Priya Nair" points={2210} inverse />
        <LeaderboardRow rank={5} name="Tom Becker" points={1980} inverse />
      </div>
    </div>
  );
}

function ProjectorApp() {
  const [i, setI] = React.useState(0);
  const scene = SCENES[i];
  return (
    <div className="pulse-stage" data-screen-label="Projector" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '48px 56px', gap: 40 }}>
      <StageHeader />
      <CountBanner />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {scene === 'poll' && <PollScene />}
        {scene === 'wordcloud' && <WordCloudScene />}
        {scene === 'leaderboard' && <LeaderboardScene />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        {SCENES.map((s, idx) => (
          <button key={s} onClick={() => setI(idx)} aria-label={s} style={{
            width: idx === i ? 30 : 10, height: 10, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: idx === i ? 'var(--teal-300)' : 'var(--border-strong)', transition: 'all var(--dur-base) var(--ease-standard)',
          }} />
        ))}
      </div>
    </div>
  );
}

window.ProjectorApp = ProjectorApp;

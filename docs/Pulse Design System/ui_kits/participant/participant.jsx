/* Pulse — Participant UI kit. Phone-framed live voting + Q&A. */
const { Button, Badge, Input, Avatar, JoinCode, PollResult, QuestionCard, Textarea, AIBadge } = window.PulseDesignSystem_424f5e;

const Ic = ({ n, s = 18, c = 'currentColor' }) => {
  const d = window.lucide?.icons?.[n];
  return d ? <span style={{ display: 'inline-flex', color: c }} dangerouslySetInnerHTML={{ __html: d.toSvg({ width: s, height: s }) }} /> : null;
};

function Phone({ children }) {
  return (
    <div style={{ width: 390, height: 760, background: '#0c0c0e', borderRadius: 46, padding: 11, boxShadow: 'var(--shadow-xl)', flexShrink: 0 }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--surface-canvas)', borderRadius: 36, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', top: 9, left: '50%', transform: 'translateX(-50%)', width: 108, height: 26, background: '#0c0c0e', borderRadius: 14, zIndex: 5 }} />
        {children}
      </div>
    </div>
  );
}

function Header({ code, name }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '38px 18px 12px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src="../../assets/pulse-logomark.svg" width="24" height="24" alt="" />
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '.18em', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{code}</span>
      </div>
      {name && <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Avatar name={name} size="sm" /><span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{name.split(' ')[0]}</span></div>}
    </div>
  );
}

/* Join */
function JoinScreen({ go }) {
  const [code, setCode] = React.useState('QZ7K2P');
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 26px', gap: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 6 }}>
        <img src="../../assets/pulse-logomark.svg" width="52" height="52" alt="Pulse" />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--text-xl)' }}>Join the session</h2>
          <p style={{ marginTop: 6, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Enter the code on screen.</p>
        </div>
      </div>
      <Input code value={code} maxLength={6} onChange={(e) => setCode(e.target.value.toUpperCase())} />
      <Button variant="primary" size="lg" block onClick={() => go('name')}>Continue</Button>
      <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>No app · no login</p>
    </div>
  );
}

function NameScreen({ go }) {
  const [name, setName] = React.useState('');
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 26px', gap: 16 }}>
      <h2 style={{ fontSize: 'var(--text-xl)' }}>Joining QZ7K2P</h2>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: -8 }}>Add your name, or join anonymously.</p>
      <Input label="Your name (optional)" placeholder="e.g. Alex" value={name} onChange={(e) => setName(e.target.value)} />
      <Button variant="primary" size="lg" block onClick={() => go('poll', name || 'You')}>Join event</Button>
      <Button variant="ghost" size="md" block onClick={() => go('poll', '')}>Join anonymously</Button>
    </div>
  );
}

/* Live poll vote */
function PollVote({ go, name }) {
  const opts = ['Energized', 'Optimistic', 'Steady', 'Stretched'];
  const [sel, setSel] = React.useState(null);
  const [done, setDone] = React.useState(false);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header code="QZ7K2P" name={name} />
      <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Badge tone="brand" dot>Live poll</Badge></div>
        <h3 style={{ fontSize: 'var(--text-lg)' }}>How are you feeling about Q3?</h3>
        {!done ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {opts.map((o) => (
                <button key={o} onClick={() => setSel(o)} style={{
                  textAlign: 'left', padding: '14px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  fontSize: 'var(--text-base)', fontWeight: 500, fontFamily: 'var(--font-sans)',
                  background: sel === o ? 'var(--brand-subtle)' : 'var(--surface-card)',
                  border: `1.5px solid ${sel === o ? 'var(--brand)' : 'var(--border-default)'}`,
                  color: 'var(--text-primary)',
                }}>{o}</button>
              ))}
            </div>
            <Button variant="primary" size="lg" block disabled={!sel} onClick={() => setDone(true)}>Submit</Button>
          </>
        ) : (
          <>
            <Badge tone="success" dot>Response submitted</Badge>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
              <PollResult label="Energized" count={612} total={1284} index={0} leading />
              <PollResult label="Optimistic" count={398} total={1284} index={1} />
              <PollResult label="Steady" count={214} total={1284} index={2} />
              <PollResult label="Stretched" count={60} total={1284} index={3} />
            </div>
            <Button variant="secondary" size="md" block onClick={() => go('qa', name)} iconRight={<Ic n="arrow-right" s={15} />}>Go to Q&amp;A</Button>
          </>
        )}
      </div>
    </div>
  );
}

/* Q&A */
function QaScreen({ name }) {
  const [text, setText] = React.useState('');
  const [qs, setQs] = React.useState([
    { id: 1, text: 'Will headcount keep pace with the roadmap?', author: 'Anonymous', votes: 68, voted: false },
    { id: 2, text: 'Any update on the hybrid work policy?', author: 'Priya N.', votes: 41, voted: true },
    { id: 3, text: 'When does the new launch ship to EU?', author: 'Marco', votes: 22, voted: false },
  ]);
  const vote = (id) => setQs((p) => p.map((q) => q.id === id ? { ...q, voted: !q.voted, votes: q.votes + (q.voted ? -1 : 1) } : q));
  const ask = () => { if (!text.trim()) return; setQs((p) => [{ id: Date.now(), text, author: name || 'You', votes: 1, voted: true }, ...p]); setText(''); };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header code="QZ7K2P" name={name} />
      <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3 style={{ fontSize: 'var(--text-lg)' }}>Q&amp;A</h3>
        <Textarea label="Ask the room" value={text} onChange={(e) => setText(e.target.value)} maxLength={300} rows={3} placeholder="Type your question…" />
        <Button variant="primary" size="md" block disabled={!text.trim()} onClick={ask}>Submit question</Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Top questions</span>
          <span style={{ marginLeft: 'auto' }}><AIBadge label="AI sorted" /></span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...qs].sort((a, b) => b.votes - a.votes).map((q) => (
            <QuestionCard key={q.id} text={q.text} author={q.author} votes={q.votes} voted={q.voted} onUpvote={() => vote(q.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ParticipantApp() {
  const [screen, setScreen] = React.useState('join');
  const [name, setName] = React.useState('');
  const go = (s, n) => { if (n !== undefined) setName(n); setScreen(s); };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36, padding: 40, background: 'var(--surface-canvas)', flexWrap: 'wrap' }}>
      <Phone>
        <div data-screen-label="Participant" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {screen === 'join' && <JoinScreen go={go} />}
          {screen === 'name' && <NameScreen go={go} />}
          {screen === 'poll' && <PollVote go={go} name={name} />}
          {screen === 'qa' && <QaScreen name={name} />}
        </div>
      </Phone>
      <div style={{ maxWidth: 240, color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
        <img src="../../assets/pulse-wordmark.svg" width="120" alt="Pulse" style={{ marginBottom: 14 }} />
        <p><strong style={{ color: 'var(--text-secondary)' }}>Participant view.</strong> Tap through: enter code → name → vote on a live poll → ask &amp; upvote in Q&amp;A. No app, no login.</p>
      </div>
    </div>
  );
}

window.ParticipantApp = ParticipantApp;

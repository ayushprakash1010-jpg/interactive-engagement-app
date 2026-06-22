/* Pulse — Host UI kit screens. Composes design-system primitives from the bundle. */
const { Button, IconButton, Badge, Card, Input, Switch, Avatar, Stat,
        JoinCode, PollResult, ActivityTile, LeaderboardRow, QuestionCard,
        AIComposer, AISummaryCard, SuggestionChip, AIBadge, AISparkle } = window.PulseDesignSystem_424f5e;

const Ic = ({ n, s = 18, c = 'currentColor' }) => {
  const d = window.lucide?.icons?.[n];
  return d ? <span style={{ display: 'inline-flex', color: c }} dangerouslySetInnerHTML={{ __html: d.toSvg({ width: s, height: s }) }} /> : null;
};

/* ---------------- Shell ---------------- */
function HostShell({ nav, children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100%', background: 'var(--surface-canvas)' }}>
      <aside style={{ width: 232, flexShrink: 0, borderRight: '1px solid var(--border-subtle)', background: 'var(--surface-card)', padding: 'var(--space-5) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <img src="../../assets/pulse-wordmark.svg" width="120" alt="Pulse" />
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[['home','Events','grid-2x2'],['ai','AI Studio','sparkles'],['analytics','Analytics','bar-chart-3'],['settings','Settings','settings']].map(([k,label,icon]) => (
            <div key={k} onClick={() => nav.go(k)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              background: nav.at === k ? 'var(--brand-subtle)' : 'transparent',
              color: nav.at === k ? 'var(--brand-subtle-text)' : 'var(--text-secondary)',
              fontWeight: nav.at === k ? 600 : 500, fontSize: 'var(--text-sm)',
            }}>
              <Ic n={icon} s={17} />{label}
              {k === 'ai' && <span style={{ marginLeft: 'auto' }}><AIBadge label="New" /></span>}
            </div>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px' }}>
          <Avatar name="Dana Owens" size="md" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Dana Owens</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Pro workspace</div>
          </div>
        </div>
      </aside>
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>{children}</main>
    </div>
  );
}

function TopBar({ title, sub, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: 'var(--space-8) var(--space-8) var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-2xl)' }}>{title}</h1>
        {sub && <p style={{ marginTop: 4, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>{actions}</div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
const EVENTS = [
  { name: 'Q3 Company All-Hands', code: 'QZ7K2P', status: 'live', acts: 6, parts: 1284 },
  { name: 'Product Onboarding 101', code: 'MX4T9A', status: 'scheduled', acts: 4, parts: 0 },
  { name: 'Design Crit — Mobile', code: 'BK2W7C', status: 'draft', acts: 2, parts: 0 },
  { name: 'Customer Advisory Board', code: 'LP8N3R', status: 'ended', acts: 9, parts: 342 },
];
const STATUS = { live: ['live','Live'], scheduled: ['info','Scheduled'], draft: ['neutral','Draft'], ended: ['neutral','Ended'] };

function Dashboard({ nav }) {
  return (
    <div>
      <TopBar title="Events" sub="Create an event, then share its code or QR with the room."
        actions={<><Button variant="secondary" iconLeft={<Ic n="sparkles" s={16} />} onClick={() => nav.go('ai')}>AI Studio</Button>
          <Button variant="primary" iconLeft={<Ic n="plus" s={16} />} onClick={() => nav.go('builder')}>Create event</Button></>} />
      <div style={{ padding: '0 var(--space-8) var(--space-8)' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 'var(--space-6)' }}>
          <Card style={{ flex: 1 }}><Stat value="12" label="Active events" icon={<Ic n="radio" s={16} />} /></Card>
          <Card style={{ flex: 1 }}><Stat value="1,626" label="Participants this week" tone="brand" icon={<Ic n="users" s={16} />} /></Card>
          <Card style={{ flex: 1 }}><Stat value="94%" label="Avg. participation" icon={<Ic n="activity" s={16} />} /></Card>
          <Card tone="ai" style={{ flex: 1 }}><Stat value="38" label="AI drafts used" tone="ai" icon={<AISparkle size={16} />} /></Card>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {EVENTS.map((e) => (
            <Card key={e.code} interactive padding="md" onClick={() => nav.go('builder')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>{e.name}</div>
                  <div style={{ marginTop: 4, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{e.acts} activities{e.parts > 0 ? ` · ${e.parts.toLocaleString()} joined` : ''}</div>
                </div>
                <Badge tone={STATUS[e.status][0]}>{STATUS[e.status][1]}</Badge>
              </div>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <JoinCode code={e.code} size="sm" />
                <Button variant="ghost" size="sm" iconRight={<Ic n="arrow-right" s={15} />}>Open</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- AI Studio ---------------- */
const DRAFTED = [
  { type: 'poll', icon: 'bar-chart-3', title: 'How are you feeling about Q3 so far?', meta: 'Rating · 1–5' },
  { type: 'wordcloud', icon: 'cloud', title: 'One word for our biggest win this quarter', meta: 'Word cloud' },
  { type: 'quiz', icon: 'trophy', title: 'Quick quiz: our new product names', meta: 'Quiz · 3 questions' },
  { type: 'qa', icon: 'messages-square', title: 'Open Q&A with the leadership team', meta: 'Q&A · moderated' },
];

function AIStudio({ nav }) {
  const [prompt, setPrompt] = React.useState('Kick off our Q3 all-hands for 1,200 people — warm up the room, take the pulse on morale, then open Q&A.');
  const [generated, setGenerated] = React.useState(true);
  return (
    <div>
      <TopBar title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>AI Studio <AIBadge label="Beta" gradient /></span>}
        sub="Describe your session. Pulse drafts a runnable agenda you can edit." />
      <div style={{ padding: '0 var(--space-8) var(--space-8)', maxWidth: 760 }}>
        <AIComposer value={prompt} onChange={setPrompt} onGenerate={() => setGenerated(true)}
          suggestions={['Icebreaker for 50 new hires', 'Sprint retro: start / stop / continue', '5-question product trivia']} />
        {generated && (
          <div style={{ marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <AISparkle size={16} color="var(--ai)" />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>Drafted agenda · 4 activities</span>
              <span style={{ marginLeft: 'auto' }}><Button variant="ai" size="sm" iconLeft={<Ic n="check" s={15} />} onClick={() => nav.go('builder')}>Add all to event</Button></span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DRAFTED.map((d, i) => (
                <Card key={i} padding="sm" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--ai-subtle)', color: 'var(--ai)', flexShrink: 0 }}><Ic n={d.icon} s={18} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>{d.title}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{d.meta}</div>
                  </div>
                  <Badge tone="ai" size="sm">AI</Badge>
                  <IconButton label="Edit" variant="ghost"><Ic n="pencil" s={16} /></IconButton>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Builder + Run ---------------- */
const ACTIVITY_PALETTE = [
  ['poll','bar-chart-3','Poll','Single, multiple, rating, open'],
  ['quiz','trophy','Quiz','Timed, scored, leaderboard'],
  ['wordcloud','cloud','Word cloud','Live weighted cloud'],
  ['qa','messages-square','Q&A','Moderated, upvoted'],
  ['feedback','star','Feedback','Rating + open text'],
];

function Builder({ nav }) {
  const [running, setRunning] = React.useState(false);
  return (
    <div>
      <TopBar title="Q3 Company All-Hands"
        sub={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Badge tone={running ? 'live' : 'neutral'}>{running ? 'Live now' : 'Draft'}</Badge> · 6 activities</span>}
        actions={<>
          <Button variant="secondary" iconLeft={<Ic n="monitor" s={16} />}>Present</Button>
          {running
            ? <Button variant="danger" iconLeft={<Ic n="square" s={15} />} onClick={() => setRunning(false)}>End event</Button>
            : <Button variant="primary" iconLeft={<Ic n="play" s={15} />} onClick={() => setRunning(true)}>Go live</Button>}
        </>} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-6)', padding: '0 var(--space-8) var(--space-8)' }}>
        <div>
          {running ? <RunPanel /> : <>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Add an activity</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 'var(--space-8)' }}>
              {ACTIVITY_PALETTE.map(([t, icon, title, desc]) => (
                <ActivityTile key={t} type={t} icon={<Ic n={icon} s={20} />} title={title} description={desc} />
              ))}
              <ActivityTile type="ai" icon={<AISparkle size={20} />} title="Draft with AI" description="Describe it, get activities" onClick={() => nav.go('ai')} />
            </div>
          </>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card padding="md">
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 10 }}>Join</p>
            <JoinCode code="QZ7K2P" size="md" onCopy={() => {}} />
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}><Ic n="qr-code" s={36} /></div>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>pulse.live/QZ7K2P</span>
            </div>
          </Card>
          <Card tone="ai" padding="md">
            <SuggestionChip text="Add a follow-up poll on remote work" onAccept={() => {}} onDismiss={() => {}} style={{ background: 'var(--surface-card)' }} />
            <div style={{ height: 10 }} />
            <SuggestionChip text="Shorten quiz to 3 questions" onAccept={() => {}} onDismiss={() => {}} style={{ background: 'var(--surface-card)' }} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function RunPanel() {
  return (
    <Card padding="md">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Badge tone="brand" dot>Poll · live</Badge>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>How are you feeling about Q3?</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm">Close poll</Button>
          <Button variant="primary" size="sm" iconRight={<Ic n="skip-forward" s={14} />}>Next</Button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <PollResult label="Energized" count={612} total={1284} index={0} leading />
        <PollResult label="Optimistic" count={398} total={1284} index={1} />
        <PollResult label="Steady" count={214} total={1284} index={2} />
        <PollResult label="Stretched" count={60} total={1284} index={3} />
      </div>
      <AISummaryCard title="Live read" body="Sentiment skews positive — “energized” and “optimistic” lead 79% of the room. A small but vocal “stretched” cluster mentions workload."
        footnote="Updated from 1,284 live responses" />
    </Card>
  );
}

/* ---------------- Analytics ---------------- */
function Analytics() {
  return (
    <div>
      <TopBar title="Q3 All-Hands — Analytics" sub="Generated just now · 1,284 participants"
        actions={<><Button variant="secondary" size="md" iconLeft={<Ic n="download" s={15} />}>CSV</Button><Button variant="secondary" size="md" iconLeft={<Ic n="download" s={15} />}>PDF</Button></>} />
      <div style={{ padding: '0 var(--space-8) var(--space-8)' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 'var(--space-6)' }}>
          <Card style={{ flex: 1 }}><Stat value="1,284" label="Participants" icon={<Ic n="users" s={16} />} /></Card>
          <Card style={{ flex: 1 }}><Stat value="94%" label="Participation rate" sub="1,207 of 1,284 responded" tone="brand" /></Card>
          <Card style={{ flex: 1 }}><Stat value="5,902" label="Total responses" /></Card>
          <Card style={{ flex: 1 }}><Stat value="38" label="Questions asked" sub="29 answered" /></Card>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
          <Card padding="md">
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 14 }}>Poll · How are you feeling about Q3?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <PollResult label="Energized" count={612} total={1284} index={0} leading />
              <PollResult label="Optimistic" count={398} total={1284} index={1} />
              <PollResult label="Steady" count={214} total={1284} index={2} />
              <PollResult label="Stretched" count={60} total={1284} index={3} />
            </div>
          </Card>
          <AISummaryCard title="Executive summary"
            body="Morale is strong heading into Q3. Open responses and Q&A converge on two themes."
            themes={[{ label: 'Excitement for the new launch', count: 214 }, { label: 'Concern about workload & hiring', count: 96 }, { label: 'Requests for clearer roadmap', count: 71 }]}
            footnote="Summarized from 5,902 responses across 6 activities" />
        </div>
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Card padding="md">
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 12 }}>Quiz leaderboard</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <LeaderboardRow rank={1} name="Mara Lee" points={2840} />
              <LeaderboardRow rank={2} name="Alex Rivera" points={2710} />
              <LeaderboardRow rank={3} name="Sam Cho" points={2480} />
            </div>
          </Card>
          <Card padding="md">
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 12 }}>Top questions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <QuestionCard text="Will headcount keep pace with the roadmap?" author="Anonymous" votes={68} answered />
              <QuestionCard text="Any update on the hybrid work policy?" author="Priya N." votes={41} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HostApp() {
  const [at, setAt] = React.useState('home');
  const nav = { at, go: setAt };
  const navFor = ['home','ai','analytics','settings'].includes(at) ? at : 'home';
  return (
    <HostShell nav={{ at: navFor, go: setAt }}>
      {at === 'home' && <Dashboard nav={nav} />}
      {at === 'ai' && <AIStudio nav={nav} />}
      {at === 'builder' && <Builder nav={nav} />}
      {at === 'analytics' && <Analytics />}
      {at === 'settings' && <Analytics />}
    </HostShell>
  );
}

window.HostApp = HostApp;

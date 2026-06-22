Primary action button — use for any clickable action; `variant="ai"` marks AI-assisted actions (generate, summarize).

```jsx
<Button variant="primary" size="lg">Create event</Button>
<Button variant="ai" iconLeft={<Sparkles size={16} />}>Generate poll</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="primary" block loading>Saving…</Button>
```

Variants: `primary` (teal), `secondary` (outlined on card), `ghost` (toolbar), `danger` (destructive), `ai` (iris). Sizes: `sm`, `md`, `lg`, `xl`. Use `block` for full-width participant CTAs; `lg`/`xl` give 44px+ touch targets.

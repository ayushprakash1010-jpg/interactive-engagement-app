Single live poll-result bar. Stack several (incrementing `index`) to build a results chart; mark the winner with `leading`. Use `inverse` on the projector.

```jsx
<PollResult label="Strongly agree" count={84} total={140} index={0} leading />
<PollResult label="Agree" count={38} total={140} index={1} />
```

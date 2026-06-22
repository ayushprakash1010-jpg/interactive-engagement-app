AI insight card — summarize open-text answers, cluster Q&A themes, or report sentiment. Use `shimmer` for the loading state.

```jsx
<AISummaryCard
  title="What the room is saying"
  body="Responses cluster around speed and onboarding friction."
  themes={[{label:'Faster setup', count:34}, {label:'Clearer docs', count:21}]}
  footnote="Summarized from 142 open responses"
/>
<AISummaryCard shimmer />
```

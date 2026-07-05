const e = (value: unknown): string => {
  const str = value == null ? '' : String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

const pct = (value: number) => `${Number((value ?? 0).toFixed(1))}%`;

const section = (title: string, body: string, hasData = true) =>
  hasData
    ? `
  <section class="section">
    <h2>${e(title)}</h2>
    ${body}
  </section>
`
    : '';

const list = (items: string[]) =>
  items.length
    ? `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`
    : `<p class="empty">No data available.</p>`;

const kvTable = (rows: Array<[string, unknown]>) => `
  <table class="kv-table">
    <tbody>
      ${rows
        .map(
          ([label, value]) => `
            <tr>
              <th>${e(label)}</th>
              <td>${e(value)}</td>
            </tr>
          `,
        )
        .join('')}
    </tbody>
  </table>
`;

const block = (title: string, body: string) => `
  <div class="block">
    <h3>${e(title)}</h3>
    ${body}
  </div>
`;

const normalizeRatingDistribution = (
  distribution: unknown,
): Array<{ rating: string; count: number }> => {
  if (Array.isArray(distribution)) {
    return distribution.map((entry: { rating?: unknown; count?: unknown }) => ({
      rating: String(entry?.rating ?? ''),
      count: Number(entry?.count ?? 0),
    }));
  }

  return Object.entries((distribution ?? {}) as Record<string, unknown>).map(
    ([rating, count]) => ({
      rating,
      count: Number(count ?? 0),
    }),
  );
};

const normalizeQuestionPct = (value: unknown): number => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return 0;
  return num <= 1 ? num * 100 : num;
};

export function buildAnalyticsReportHtml(data: any): string {
  const hs = data?.headlineStats ?? {};
  const eventId = data?.eventId ?? 'Unknown Event';
  const generatedAt = data?.generatedAt ?? new Date().toISOString();

  const pollAnalytics = Array.isArray(data?.pollAnalytics) ? data.pollAnalytics : [];
  const quizAnalytics = Array.isArray(data?.quizAnalytics) ? data.quizAnalytics : [];
  const wordCloudAnalytics = Array.isArray(data?.wordCloudAnalytics)
    ? data.wordCloudAnalytics
    : [];
  const feedbackAnalytics = Array.isArray(data?.feedbackAnalytics)
    ? data.feedbackAnalytics
    : [];
  const engagementTimeline = Array.isArray(data?.engagementTimeline)
    ? data.engagementTimeline
    : [];

  const headlineBody = kvTable([
    ['Event ID', eventId],
    ['Generated At', generatedAt],
    ['Total Participants', hs.totalParticipants ?? 0],
    ['Total Responses', hs.totalResponses ?? 0],
    ['Unique Responders', hs.uniqueResponders ?? 0],
    ['Participation Rate', pct(Number(hs.participationRate ?? 0))],
  ]);

  const pollBody = pollAnalytics.length
    ? pollAnalytics
        .map((poll: any) => {
          let content = kvTable([
            ['Type', poll.pollType ?? 'unknown'],
            ['Total Responses', poll.totalResponses ?? 0],
          ]);

          if (poll.pollType === 'open') {
            content += list((poll.responses ?? []).map((r: string) => e(r)));
          } else if (poll.pollType === 'rating') {
            const distributionEntries = normalizeRatingDistribution(poll.distribution);

            content += `<p><strong>Average rating:</strong> ${e(poll.average ?? 0)}</p>`;
            content += list(
              distributionEntries.map(({ rating, count }) => {
                const totalResponses = Number(poll.totalResponses ?? 0);
                const percentage = totalResponses === 0 ? 0 : (count / totalResponses) * 100;
                return `Rating ${e(rating)} - ${e(count)} (${pct(percentage)})`;
              }),
            );
          } else {
            content += list(
              (poll.options ?? []).map(
                (o: any) =>
                  `${e(o.label)} - ${e(o.count)} (${pct(Number((o.percentage ?? 0) * 100))})`,
              ),
            );
          }

          return block(
            `${poll.title ?? 'Untitled Poll'} [${poll.pollType ?? 'unknown'}]`,
            content,
          );
        })
        .join('')
    : `<p class="empty">No poll analytics available.</p>`;

const resolveParticipantName = (entry: any): string => {
  const anonId = entry?.participantAnonId ?? entry?.anonId ?? 'anonymous';
  const displayName = entry?.displayName;
  return typeof displayName === 'string' && displayName.trim().length > 0
    ? displayName.trim()
    : `Participant ${String(anonId).slice(0, 6)}`;
};

  const quizBody = quizAnalytics.length
    ? quizAnalytics
        .map((quiz: any) => {
          const leaderboardContent = `
            <p><strong>Leaderboard (Top 10)</strong></p>
            ${list(
              (quiz.leaderboard ?? [])
                .slice(0, 10)
                .map(
                  (entry: any, i: number) =>
                    `#${i + 1} ${e(resolveParticipantName(entry))} - ${e(entry.totalPoints ?? entry.points ?? 0)} pts`,
                ),
            )}
          `;

          const questionContent = `
            <p><strong>Question Accuracy</strong></p>
            ${list(
              (quiz.questionStats ?? []).map((q: any) => {
                const percent = normalizeQuestionPct(q.correctPct);
                return `${e(q.text ?? 'Untitled question')} - ${e(q.correct ?? 0)}/${e(q.total ?? 0)} (${pct(percent)})`;
              }),
            )}
          `;

          return block(quiz.title ?? 'Untitled Quiz', leaderboardContent + questionContent);
        })
        .join('')
    : `<p class="empty">No quiz analytics available.</p>`;

  const qa = data?.qaAnalytics ?? {};
  const qaBody = `
    ${kvTable([
      ['Total Questions', qa.totalQuestions ?? 0],
      ['Approved', qa.approvedQuestions ?? 0],
      ['Answered', qa.answeredQuestions ?? 0],
    ])}
    ${block(
      'Top Questions',
      list(
        (qa.topQuestions ?? []).map(
          (q: any) => `${e(q.text)} - ${e(q.voteCount)} votes - ${e(q.status)}`,
        ),
      ),
    )}
  `;

  const wordCloudBody = wordCloudAnalytics.length
    ? wordCloudAnalytics
        .map((wc: any) =>
          block(
            `${wc.title ?? 'Untitled Word Cloud'}${wc.prompt ? ` - ${wc.prompt}` : ''}`,
            list(
              (wc.words ?? [])
                .slice(0, 30)
                .map((w: any) => `${e(w.text)} - ${e(w.weight)}`),
            ),
          ),
        )
        .join('')
    : `<p class="empty">No word cloud analytics available.</p>`;

  const feedbackBody = feedbackAnalytics.length
    ? feedbackAnalytics
        .map((fb: any) => {
          const intro = kvTable([
            ['Prompt', fb.prompt ?? fb.title],
            ['Total Responses', fb.totalResponses ?? 0],
          ]);

          const fieldContent = (fb.fields ?? [])
            .map((field: any) => {
              if (field.type === 'rating') {
                const distributionEntries = normalizeRatingDistribution(field.distribution);

                return `
                  <div class="sub-block">
                    <p><strong>${e(field.label)}</strong></p>
                    ${kvTable([
                      ['Average', field.average ?? 0],
                      ['Responses', field.count ?? 0],
                    ])}
                    ${list(
                      distributionEntries.map(({ rating, count }) => {
                        const total = Number(field.count ?? 0);
                        const percentage = total === 0 ? 0 : (count / total) * 100;
                        return `Rating ${e(rating)} - ${e(count)} (${pct(percentage)})`;
                      }),
                    )}
                  </div>
                `;
              }

              return `
                <div class="sub-block">
                  <p><strong>${e(field.label)}</strong></p>
                  ${kvTable([['Responses', field.count ?? 0]])}
                  ${list((field.responses ?? []).slice(0, 15).map((t: string) => e(t)))}
                </div>
              `;
            })
            .join('');

          return block(fb.title ?? 'Untitled Feedback', intro + fieldContent);
        })
        .join('')
    : `<p class="empty">No feedback analytics available.</p>`;

  const surveyAnalytics = Array.isArray(data?.surveyAnalytics) ? data.surveyAnalytics : [];
  const surveyBody = surveyAnalytics.length
    ? surveyAnalytics
        .map((survey: any) => {
          const intro = kvTable([
            ['Started', survey.totalStarted ?? 0],
            ['Completed', survey.totalCompleted ?? 0],
            ['Completion Rate', pct(Number(survey.completionRate ?? 0))],
            ['Abandonment Rate', pct(Number(survey.abandonmentRate ?? 0))],
            ['Avg Completion Time', `${survey.averageCompletionTimeSec ?? 0}s`],
          ]);

          const questionsContent = (survey.questions ?? [])
            .map((q: any) => {
              let content = kvTable([
                ['Type', q.pollType ?? 'unknown'],
                ['Total Responses', q.totalResponses ?? 0],
              ]);

              if (q.pollType === 'open') {
                content += list((q.responses ?? []).map((r: string) => e(r)));
              } else if (q.pollType === 'rating') {
                const distributionEntries = normalizeRatingDistribution(q.distribution);
                content += `<p><strong>Average rating:</strong> ${e(q.average ?? 0)}</p>`;
                content += list(
                  distributionEntries.map(({ rating, count }) => {
                    const totalResponses = Number(q.totalResponses ?? 0);
                    const percentage = totalResponses === 0 ? 0 : (count / totalResponses) * 100;
                    return `Rating ${e(rating)} - ${e(count)} (${pct(percentage)})`;
                  }),
                );
              } else {
                content += list(
                  (q.options ?? []).map(
                    (o: any) =>
                      `${e(o.label)} - ${e(o.count)} (${pct(Number((o.percentage ?? 0) * 100))})`,
                  ),
                );
              }

              return `
                <div class="sub-block">
                  <p><strong>${e(q.title ?? 'Untitled Question')}</strong></p>
                  ${content}
                </div>
              `;
            })
            .join('');

          return block(survey.title ?? 'Untitled Survey', intro + questionsContent);
        })
        .join('')
    : `<p class="empty">No survey analytics available.</p>`;

  const formatIST = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }) + ' IST';
    } catch {
      return dateStr;
    }
  };

  const timelineBody = engagementTimeline.length
    ? list(
        engagementTimeline.map(
          (p: any) => `${e(formatIST(p.minute))} - ${e(p.responses)} responses`,
        ),
      )
    : `<p class="empty">No engagement data available.</p>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Analytics Report - ${e(eventId)}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        color: #000000;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12px;
        line-height: 1.45;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      * {
        box-sizing: border-box;
      }

      h1 {
        font-size: 20px;
        margin: 0 0 8px 0;
        font-weight: 700;
      }

      h2 {
        font-size: 15px;
        margin: 0 0 10px 0;
        padding: 0 0 4px 0;
        border-bottom: 1px solid #000;
        font-weight: 700;
      }

      h3 {
        font-size: 13px;
        margin: 0 0 8px 0;
        font-weight: 700;
      }

      p {
        margin: 0 0 8px 0;
      }

      .section {
        margin: 0 0 18px 0;
      }

      .section + .section {
        border-top: 2px solid #000;
        padding-top: 14px;
      }

      .block,
      .sub-block {
        margin: 0 0 12px 0;
        padding: 8px 10px;
        border: 1px solid #cccccc;
        border-radius: 4px;
        page-break-inside: avoid;
      }

      .kv-table {
        width: 100%;
        border-collapse: collapse;
        margin: 0 0 10px 0;
        table-layout: fixed;
      }

      .kv-table th,
      .kv-table td {
        border: 1px solid #cccccc;
        padding: 6px 8px;
        text-align: left;
        vertical-align: top;
        word-break: break-word;
      }

      .kv-table th {
        width: 34%;
        font-weight: 700;
        background-color: #f9f9f9;
      }

      ul {
        margin: 0 0 8px 18px;
        padding: 0;
      }

      li {
        margin: 0 0 4px 0;
      }

      .empty {
        font-style: italic;
        color: #666666;
      }

      .header {
        margin: 0 0 18px 0;
        padding: 0 0 10px 0;
        border-bottom: 2px solid #000;
      }

      .meta {
        margin: 0 0 4px 0;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Event Analytics Report</h1>
      <p class="meta"><strong>Event ID:</strong> ${e(eventId)}</p>
      <p class="meta"><strong>Generated:</strong> ${e(generatedAt)}</p>
    </div>

    ${section('Headline Stats', headlineBody)}
    ${section('Poll Analytics', pollBody, pollAnalytics.length > 0)}
    ${section('Quiz Analytics', quizBody, quizAnalytics.length > 0)}
    ${section('Q&A Analytics', qaBody, (data?.qaAnalytics?.totalQuestions ?? 0) > 0)}
    ${section('Word Cloud Analytics', wordCloudBody, wordCloudAnalytics.length > 0)}
    ${section('Feedback Analytics', feedbackBody, feedbackAnalytics.length > 0)}
    ${section('Survey Analytics', surveyBody, surveyAnalytics.length > 0)}
    ${section('Engagement Timeline', timelineBody, engagementTimeline.length > 0)}
  </body>
</html>`;
}
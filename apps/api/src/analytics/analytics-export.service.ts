import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer-core';
import { AnalyticsService } from './analytics.service';
import { buildAnalyticsReportHtml } from './templates/report-template';
import type { AuthenticatedUser } from '../auth/jwt.strategy';

@Injectable()
export class AnalyticsExportService {
  private readonly logger = new Logger(AnalyticsExportService.name);

  constructor(private readonly analyticsService: AnalyticsService) { }

  async generateCsv(eventId: string, user: AuthenticatedUser) {
    const data = await this.analyticsService.getAnalytics(eventId, user);
    const filename = `event-${eventId}-report.csv`;
    const rows: string[] = [];

    const esc = (value: unknown): string => {
      const str = value == null ? '' : String(value);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const row = (...cols: unknown[]) => rows.push(cols.map(esc).join(','));

    row('section', 'metric', 'value');

    row('event', 'eventId', data.eventId ?? '');
    row('event', 'generatedAt', data.generatedAt ?? '');

    const hs = data.headlineStats ?? {};
    row('headline', 'totalParticipants', hs.totalParticipants ?? 0);
    row('headline', 'totalResponses', hs.totalResponses ?? 0);
    row('headline', 'uniqueResponders', hs.uniqueResponders ?? 0);
    row('headline', 'participationRate', hs.participationRate ?? 0);

    for (const poll of data.pollAnalytics ?? []) {
      if (poll.pollType === 'open') {
        for (const text of poll.responses ?? []) {
          row('poll-open', poll.title, text);
        }
      } else if (poll.pollType === 'rating') {
        row('poll-rating', `${poll.title} :: average`, poll.average ?? 0);

        const distribution = Array.isArray(poll.distribution)
          ? Object.fromEntries(
            poll.distribution.map(
              (entry: { rating: number | string; count: number }) => [
                String(entry.rating),
                entry.count,
              ],
            ),
          )
          : (poll.distribution ?? {});

        for (const [rating, count] of Object.entries(distribution)) {
          const totalResponses = Number(poll.totalResponses ?? 0);
          const percentage =
            totalResponses === 0
              ? 0
              : Number(((Number(count) / totalResponses) * 100).toFixed(1));

          row(
            'poll-rating-dist',
            `${poll.title} :: rating ${rating}`,
            `${count} (${percentage}%)`,
          );
        }
      } else {
        for (const opt of poll.options ?? []) {
          row(
            'poll-choice',
            `${poll.title} :: ${opt.label}`,
            `${opt.count} (${Number((opt.percentage * 100).toFixed(1))}%)`,
          );
        }
      }
    }

    for (const quiz of data.quizAnalytics ?? []) {
      for (const entry of quiz.leaderboard ?? []) {
        row(
          'quiz-leaderboard',
          `${quiz.title} :: ${entry.participantAnonId ?? entry.anonId ?? 'anonymous'}`,
          entry.totalPoints ?? 0,
        );
      }

      for (const q of quiz.questionStats ?? []) {
        const correctPct =
          typeof q.correctPct === 'number'
            ? q.correctPct <= 1
              ? q.correctPct * 100
              : q.correctPct
            : 0;

        row(
          'quiz-question',
          `${quiz.title} :: ${q.text ?? 'Untitled question'}`,
          `${q.correct}/${q.total} (${Number(correctPct.toFixed(1))}%)`,
        );
      }
    }

    const qa = data.qaAnalytics ?? {};
    row('qa', 'totalQuestions', qa.totalQuestions ?? 0);
    row('qa', 'approvedQuestions', qa.approvedQuestions ?? 0);
    row('qa', 'answeredQuestions', qa.answeredQuestions ?? 0);

    for (const q of qa.topQuestions ?? []) {
      row('qa-top', q.text, `${q.voteCount} votes | ${q.status}`);
    }

    for (const wc of data.wordCloudAnalytics ?? []) {
      for (const word of wc.words ?? []) {
        row('wordcloud', `${wc.title} :: ${word.text}`, word.weight);
      }
    }

    for (const fb of data.feedbackAnalytics ?? []) {
      row('feedback', `${fb.title} :: totalResponses`, fb.totalResponses ?? 0);

      for (const field of fb.fields ?? []) {
        if (field.type === 'rating') {
          row(
            'feedback-rating',
            `${fb.title} :: ${field.label} :: average`,
            field.average ?? 0,
          );

          const distribution = field.distribution ?? {};
          for (const [rating, count] of Object.entries(distribution)) {
            const total = Number(field.count ?? 0);
            const percentage =
              total === 0
                ? 0
                : Number(((Number(count) / total) * 100).toFixed(1));

            row(
              'feedback-rating-dist',
              `${fb.title} :: ${field.label} :: rating ${rating}`,
              `${count} (${percentage}%)`,
            );
          }
        } else {
          for (const text of field.responses ?? []) {
            row('feedback-text', `${fb.title} :: ${field.label}`, text);
          }
        }
      }
    }

    for (const survey of (data as any).surveyAnalytics ?? []) {
      row('survey', `${survey.title} :: totalStarted`, survey.totalStarted ?? 0);
      row('survey', `${survey.title} :: totalCompleted`, survey.totalCompleted ?? 0);
      row('survey', `${survey.title} :: completionRate`, survey.completionRate ?? 0);
      row('survey', `${survey.title} :: abandonmentRate`, survey.abandonmentRate ?? 0);
      row('survey', `${survey.title} :: averageCompletionTimeSec`, survey.averageCompletionTimeSec ?? 0);

      for (const q of survey.questions ?? []) {
        if (q.pollType === 'open') {
          for (const text of q.responses ?? []) {
            row('survey-open', `${survey.title} :: ${q.title}`, text);
          }
        } else if (q.pollType === 'rating') {
          row('survey-rating', `${survey.title} :: ${q.title} :: average`, q.average ?? 0);
          const distribution = Array.isArray(q.distribution)
            ? Object.fromEntries(
              q.distribution.map(
                (entry: { rating: number | string; count: number }) => [
                  String(entry.rating),
                  entry.count,
                ],
              ),
            )
            : (q.distribution ?? {});
          for (const [rating, count] of Object.entries(distribution)) {
            const totalResponses = Number(q.totalResponses ?? 0);
            const percentage = totalResponses === 0 ? 0 : Number(((Number(count) / totalResponses) * 100).toFixed(1));
            row('survey-rating-dist', `${survey.title} :: ${q.title} :: rating ${rating}`, `${count} (${percentage}%)`);
          }
        } else {
          for (const opt of q.options ?? []) {
            row('survey-choice', `${survey.title} :: ${q.title} :: ${opt.label}`, `${opt.count} (${Number(((opt.percentage ?? 0) * 100).toFixed(1))}%)`);
          }
        }
      }
    }

    for (const point of data.engagementTimeline ?? []) {
      row('timeline', point.minute, point.responses);
    }

    const csv = '\uFEFF' + rows.join('\n');
    return { filename, buffer: Buffer.from(csv, 'utf-8') };
  }

  async generatePdf(eventId: string, user: AuthenticatedUser) {
    const data = await this.analyticsService.getAnalytics(eventId, user);
    const filename = `event-${eventId}-report.pdf`;
    const html = buildAnalyticsReportHtml(data);

    const executablePath =
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      'C:/Program Files/Google/Chrome/Application/chrome.exe';

    const browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ],
    });

    try {
      const page = await browser.newPage();

      // Pre-set viewport to A4 dimensions so the layout engine calculates spacing immediately
      await page.setViewport({ width: 794, height: 1122, deviceScaleFactor: 2 });

      page.on('pageerror', (err: unknown) => {
        if (err instanceof Error) {
          this.logger.error(`[pdf-page-error] ${err.message}`, err.stack);
        } else {
          this.logger.error(`[pdf-page-error] ${String(err)}`);
        }
      });

      // THE FIX: Convert HTML to a Base64 Data URI and navigate to it like a real URL
      // This forces Chrome to wait for the entire natural paint lifecycle.
      const base64Html = Buffer.from(html).toString('base64');
      const dataUrl = `data:text/html;base64,${base64Html}`;

      await page.goto(dataUrl, {
        waitUntil: 'networkidle0', // Absolutely guarantees the browser is done painting
      });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: false,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      return { filename, buffer: Buffer.from(pdf) };
    } finally {
      await browser.close();
    }
  }
}
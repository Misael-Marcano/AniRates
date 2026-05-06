import { MailMetricsService } from './mail-metrics.service';

describe('MailMetricsService', () => {
  it('tracks smtp outcomes', () => {
    const m = new MailMetricsService();
    expect(m.getSnapshot().smtp_attempts).toBe(0);
    m.recordSmtpAttempt();
    m.recordSmtpDelivered();
    m.recordSmtpAttempt();
    m.recordSmtpFailed('boom');
    const s = m.getSnapshot();
    expect(s.smtp_attempts).toBe(2);
    expect(s.smtp_delivered).toBe(1);
    expect(s.smtp_failed).toBe(1);
    expect(s.last_failure_message).toBe('boom');
    expect(s.updated_at).toBeTruthy();
  });

  it('counts console-only sends', () => {
    const m = new MailMetricsService();
    m.recordConsoleOnly();
    expect(m.getSnapshot().console_only).toBe(1);
  });

  it('tracks webhook and suppression counters', () => {
    const m = new MailMetricsService();
    m.recordWebhookEvent();
    m.recordWebhookDeliveredEvent();
    m.recordWebhookSuppressionNew();
    m.recordWebhookSuppressionDuplicate();
    m.recordWebhookUnknownRecipient();
    m.recordWebhookSoftBounceSkipped();
    m.recordSmtpSkippedSuppressed();
    const s = m.getSnapshot();
    expect(s.webhook_events).toBe(1);
    expect(s.webhook_delivered_events).toBe(1);
    expect(s.webhook_suppressions_new).toBe(1);
    expect(s.webhook_suppressions_duplicate).toBe(1);
    expect(s.webhook_unknown_recipient).toBe(1);
    expect(s.webhook_soft_bounce_skipped).toBe(1);
    expect(s.smtp_skipped_suppressed).toBe(1);
  });
});

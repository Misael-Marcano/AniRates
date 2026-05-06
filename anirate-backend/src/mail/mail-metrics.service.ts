import { Injectable } from '@nestjs/common';

export interface MailMetricsSnapshot {
  smtp_attempts: number;
  smtp_delivered: number;
  smtp_failed: number;
  smtp_skipped_suppressed: number;
  console_only: number;
  last_failure_message: string | null;
  webhook_events: number;
  webhook_delivered_events: number;
  webhook_suppressions_new: number;
  webhook_suppressions_duplicate: number;
  webhook_unknown_recipient: number;
  webhook_soft_bounce_skipped: number;
  updated_at: string | null;
}

@Injectable()
export class MailMetricsService {
  private smtp_attempts = 0;
  private smtp_delivered = 0;
  private smtp_failed = 0;
  private smtp_skipped_suppressed = 0;
  private console_only = 0;
  private last_failure_message: string | null = null;
  private webhook_events = 0;
  private webhook_delivered_events = 0;
  private webhook_suppressions_new = 0;
  private webhook_suppressions_duplicate = 0;
  private webhook_unknown_recipient = 0;
  private webhook_soft_bounce_skipped = 0;
  private updated_at: Date | null = null;

  recordSmtpAttempt(): void {
    this.smtp_attempts += 1;
    this.touch();
  }

  recordSmtpDelivered(): void {
    this.smtp_delivered += 1;
    this.touch();
  }

  recordSmtpFailed(message: string): void {
    this.smtp_failed += 1;
    this.last_failure_message = message.slice(0, 500);
    this.touch();
  }

  recordConsoleOnly(): void {
    this.console_only += 1;
    this.touch();
  }

  recordSmtpSkippedSuppressed(): void {
    this.smtp_skipped_suppressed += 1;
    this.touch();
  }

  recordWebhookEvent(): void {
    this.webhook_events += 1;
    this.touch();
  }

  recordWebhookDeliveredEvent(): void {
    this.webhook_delivered_events += 1;
    this.touch();
  }

  recordWebhookSuppressionNew(): void {
    this.webhook_suppressions_new += 1;
    this.touch();
  }

  recordWebhookSuppressionDuplicate(): void {
    this.webhook_suppressions_duplicate += 1;
    this.touch();
  }

  recordWebhookUnknownRecipient(): void {
    this.webhook_unknown_recipient += 1;
    this.touch();
  }

  recordWebhookSoftBounceSkipped(): void {
    this.webhook_soft_bounce_skipped += 1;
    this.touch();
  }

  getSnapshot(): MailMetricsSnapshot {
    return {
      smtp_attempts: this.smtp_attempts,
      smtp_delivered: this.smtp_delivered,
      smtp_failed: this.smtp_failed,
      smtp_skipped_suppressed: this.smtp_skipped_suppressed,
      console_only: this.console_only,
      last_failure_message: this.last_failure_message,
      webhook_events: this.webhook_events,
      webhook_delivered_events: this.webhook_delivered_events,
      webhook_suppressions_new: this.webhook_suppressions_new,
      webhook_suppressions_duplicate: this.webhook_suppressions_duplicate,
      webhook_unknown_recipient: this.webhook_unknown_recipient,
      webhook_soft_bounce_skipped: this.webhook_soft_bounce_skipped,
      updated_at: this.updated_at?.toISOString() ?? null,
    };
  }

  private touch(): void {
    this.updated_at = new Date();
  }
}

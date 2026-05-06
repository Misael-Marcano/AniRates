import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DigestService } from './digest.service';

/** Por defecto: domingos 09:00 (expresión cron 5 campos, minuto hora día-mes mes día-semana; 0 = domingo). */
const DEFAULT_WEEKLY_DIGEST_CRON = '0 9 * * 0';

@Injectable()
export class DigestScheduler {
  private readonly logger = new Logger(DigestScheduler.name);

  constructor(private readonly digestService: DigestService) {}

  @Cron(process.env.WEEKLY_DIGEST_CRON ?? DEFAULT_WEEKLY_DIGEST_CRON)
  async handleWeeklyDigestCron(): Promise<void> {
    if (process.env.DISABLE_WEEKLY_DIGEST_CRON === 'true') {
      return;
    }
    this.logger.log('Weekly digest cron tick');
    try {
      const res = await this.digestService.runWeeklyDigestJob();
      this.logger.log(
        `Weekly digest done sent=${res.sent} skipped=${res.skipped} errors=${res.errors}`,
      );
    } catch (e) {
      this.logger.error(`Weekly digest job crashed: ${(e as Error).message}`);
    }
  }
}

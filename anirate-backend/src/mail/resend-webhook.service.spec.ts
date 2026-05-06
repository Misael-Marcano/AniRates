import { ResendWebhookService } from './resend-webhook.service';
import { MailMetricsService } from './mail-metrics.service';
import type { Repository } from 'typeorm';
import type { Usuario } from '../database/entities';

describe('ResendWebhookService', () => {
  function svcWithMocks(save: jest.Mock, getOne: jest.Mock) {
    const qb = {
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockImplementation(() => getOne()),
    };
    const repo = {
      createQueryBuilder: jest.fn().mockReturnValue(qb),
      save: jest.fn().mockImplementation((...a: unknown[]) => save(...a)),
    } as unknown as Repository<Usuario>;
    const metrics = new MailMetricsService();
    const svc = new ResendWebhookService(repo, metrics);
    return { svc, metrics, repo, qb };
  }

  it('counts delivered and increments webhook_events', async () => {
    const save = jest.fn();
    const { svc, metrics } = svcWithMocks(save, jest.fn().mockResolvedValue(null));
    await svc.handleWebhookPayload({
      type: 'email.delivered',
      data: { to: ['a@x.com'] },
    });
    expect(metrics.getSnapshot().webhook_events).toBe(1);
    expect(metrics.getSnapshot().webhook_delivered_events).toBe(1);
    expect(save).not.toHaveBeenCalled();
  });

  it('skips temporary bounces', async () => {
    const save = jest.fn();
    const { svc, metrics } = svcWithMocks(save, jest.fn().mockResolvedValue(null));
    await svc.handleWebhookPayload({
      type: 'email.bounced',
      data: {
        to: ['b@x.com'],
        bounce: { type: 'Temporary', message: 'try later' },
      },
    });
    expect(metrics.getSnapshot().webhook_soft_bounce_skipped).toBe(1);
    expect(save).not.toHaveBeenCalled();
  });

  it('suppresses permanent bounce for known user', async () => {
    const user: Partial<Usuario> = {
      id: 1,
      email: 'c@x.com',
      email_delivery_suppressed_at: null,
    };
    const save = jest.fn().mockResolvedValue(user);
    const getOne = jest.fn().mockResolvedValue(user);
    const { svc, metrics, repo } = svcWithMocks(save, getOne);

    await svc.handleWebhookPayload({
      type: 'email.bounced',
      data: {
        to: ['c@x.com'],
        bounce: { type: 'Permanent', message: 'bad' },
      },
    });

    expect(repo.createQueryBuilder).toHaveBeenCalled();
    expect(save).toHaveBeenCalled();
    expect(user.email_delivery_suppressed_at).toBeInstanceOf(Date);
    expect(user.email_suppression_reason).toContain('email.bounced');
    expect(metrics.getSnapshot().webhook_suppressions_new).toBe(1);
  });

  it('counts duplicate suppression', async () => {
    const user: Partial<Usuario> = {
      id: 2,
      email: 'd@x.com',
      email_delivery_suppressed_at: new Date(),
    };
    const save = jest.fn();
    const getOne = jest.fn().mockResolvedValue(user);
    const { svc, metrics } = svcWithMocks(save, getOne);

    await svc.handleWebhookPayload({
      type: 'email.complained',
      data: { to: ['d@x.com'] },
    });

    expect(save).not.toHaveBeenCalled();
    expect(metrics.getSnapshot().webhook_suppressions_duplicate).toBe(1);
  });

  it('counts unknown recipient', async () => {
    const save = jest.fn();
    const getOne = jest.fn().mockResolvedValue(null);
    const { svc, metrics } = svcWithMocks(save, getOne);

    await svc.handleWebhookPayload({
      type: 'email.complained',
      data: { to: ['nobody@x.com'] },
    });

    expect(metrics.getSnapshot().webhook_unknown_recipient).toBe(1);
    expect(save).not.toHaveBeenCalled();
  });
});

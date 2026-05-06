import { Repository } from 'typeorm';
import { PushService } from './push.service';
import { PushSubscription, Usuario } from '../database/entities';

describe('PushService', () => {
  function makeService(
    subs: Pick<Repository<PushSubscription>, 'delete' | 'save' | 'create' | 'find'>,
    users: Pick<Repository<Usuario>, 'findOne'>,
    contenido: Pick<Repository<unknown>, 'findOne'> = { findOne: jest.fn() },
    review: Pick<Repository<unknown>, 'findOne'> = { findOne: jest.fn() },
    respuesta: Pick<Repository<unknown>, 'findOne'> = { findOne: jest.fn() },
  ) {
    return new PushService(
      subs as Repository<PushSubscription>,
      users as Repository<Usuario>,
      contenido as never,
      review as never,
      respuesta as never,
    );
  }

  it('subscribe replaces existing endpoint globally', async () => {
    const deleted: unknown[] = [];
    const saved: unknown[] = [];
    const subs = {
      delete: jest.fn(async (q: { endpoint?: string }) => {
        deleted.push(q);
      }),
      create: jest.fn((row: object) => row),
      save: jest.fn(async (row: object) => {
        saved.push(row);
        return row;
      }),
      find: jest.fn(),
    };
    const users = { findOne: jest.fn() };
    const svc = makeService(subs, users);
    await svc.subscribe(3, {
      endpoint: 'https://push.example/ep1',
      p256dh: 'x'.repeat(32),
      auth: 'y'.repeat(16),
    });
    expect(subs.delete).toHaveBeenCalledWith({
      endpoint: 'https://push.example/ep1',
    });
    expect(subs.save).toHaveBeenCalled();
    expect(saved[0]).toMatchObject({
      usuario_id: 3,
      endpoint: 'https://push.example/ep1',
    });
  });
});

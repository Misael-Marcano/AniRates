import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** JWT opcional: `req.user` si hay Bearer válido; si no hay token o falla validación, sigue sin usuario. */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{
      headers?: { authorization?: string };
    }>();
    const auth = req.headers?.authorization;
    if (!auth?.startsWith('Bearer ')) return true;
    try {
      return (await super.canActivate(context)) as boolean;
    } catch {
      return true;
    }
  }

  handleRequest<TUser>(err: unknown, user: TUser): TUser | undefined {
    if (err || !user) return undefined;
    return user;
  }
}

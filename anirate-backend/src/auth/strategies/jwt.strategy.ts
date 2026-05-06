import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, Sesion } from '../../database/entities';

export interface JwtPayload {
  sub: number;
  nombre: string;
  email: string;
  tipo: string;
  jti?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Sesion)
    private readonly sesionRepo: Repository<Sesion>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'anirate-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.usuarioRepo.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException();
    if (user.banned)
      throw new UnauthorizedException('Cuenta suspendida');

    if (payload.jti) {
      const sesion = await this.sesionRepo.findOne({
        where: { jti: payload.jti },
      });
      if (!sesion || sesion.revoked_at)
        throw new UnauthorizedException('Sesión revocada');
      sesion.last_used_at = new Date();
      this.sesionRepo.save(sesion).catch(() => {});
    }

    return payload;
  }
}

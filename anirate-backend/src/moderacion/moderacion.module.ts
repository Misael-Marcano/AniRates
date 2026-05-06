import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModeracionLog } from '../database/entities';
import { ModeracionAuditService } from './moderacion-audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([ModeracionLog])],
  providers: [ModeracionAuditService],
  exports: [ModeracionAuditService],
})
export class ModeracionModule {}

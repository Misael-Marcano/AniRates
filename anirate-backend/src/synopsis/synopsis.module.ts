import { Module } from '@nestjs/common';
import { SynopsisController } from './synopsis.controller';
import { SynopsisService } from './synopsis.service';
import { CoverArtService } from './cover-art.service';

@Module({
  controllers: [SynopsisController],
  providers: [SynopsisService, CoverArtService],
})
export class SynopsisModule {}

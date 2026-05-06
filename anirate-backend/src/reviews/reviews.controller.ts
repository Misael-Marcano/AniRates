import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  BadRequestException,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from './reviews.service';
import { ReviewsUploadService } from './reviews-upload.service';
import {
  CreateReviewDto,
  UpdateReviewDto,
  CreateReplyDto,
  UpdateReviewFeaturedDto,
  ReportReviewDto,
  PatchReviewReportDto,
} from './dto/review.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly reviewsUploadService: ReviewsUploadService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreateReviewDto, @Request() req: { user: JwtPayload }) {
    return this.reviewsService.create(dto, req.user.sub);
  }

  @Get('my-votes')
  @UseGuards(AuthGuard('jwt'))
  getMyVotes(
    @Query('jikanId', ParseIntPipe) jikanId: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.reviewsService.getMyVotes(req.user.sub, jikanId);
  }

  @Get('counts')
  getCounts(@Query('jikan_ids') ids: string) {
    if (!ids) return {};
    const parsed = ids
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (parsed.length === 0) return {};
    if (parsed.length > 100) throw new BadRequestException('Max 100 ids');
    return this.reviewsService.getCountsByJikanIds(parsed);
  }

  @Get('upload-status')
  uploadStatus() {
    return { enabled: this.reviewsUploadService.isEnabled() };
  }

  @Post('upload-imagen')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  uploadReviewImage(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file?.buffer) throw new BadRequestException('Archivo requerido');
    return this.reviewsUploadService.uploadReviewImage(
      file.buffer,
      file.mimetype,
    );
  }

  @Get('admin/reports')
  @UseGuards(AuthGuard('jwt'))
  listReports(@Request() req: { user: JwtPayload }) {
    return this.reviewsService.listReportsForAdmin(req.user.tipo);
  }

  @Patch('admin/reports/:reportId')
  @UseGuards(AuthGuard('jwt'))
  patchAdminReport(
    @Param('reportId', ParseIntPipe) reportId: number,
    @Body() dto: PatchReviewReportDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.reviewsService.setReportResolved(
      reportId,
      req.user.tipo,
      dto.resuelto,
      req.user.sub,
    );
  }

  @Get('contenido/:id')
  findByContenido(
    @Param('id', ParseIntPipe) id: number,
    @Query('sort') sort?: 'recent' | 'top',
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.findByContenido(id, { sort, cursor, limit });
  }

  @Get('user/:id')
  @UseGuards(OptionalJwtAuthGuard)
  findByUser(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user?: JwtPayload },
  ) {
    return this.reviewsService.findByUser(id, req.user?.sub, req.user?.tipo);
  }

  @Get(':id/versiones')
  listVersions(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.listVersions(id);
  }

  @Get(':id/respuestas')
  listReplies(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.listReplies(id);
  }

  @Post(':id/respuestas')
  @UseGuards(AuthGuard('jwt'))
  createReply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReplyDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.reviewsService.createReply(id, req.user.sub, dto.comentario);
  }

  @Post(':id/report')
  @UseGuards(AuthGuard('jwt'))
  report(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReportReviewDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.reviewsService.reportReview(id, req.user.sub, dto.motivo);
  }

  @Delete('respuestas/:rid')
  @UseGuards(AuthGuard('jwt'))
  deleteReply(
    @Param('rid', ParseIntPipe) rid: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.reviewsService.deleteReply(rid, req.user.sub);
  }

  @Post(':id/vote')
  @UseGuards(AuthGuard('jwt'))
  vote(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.reviewsService.vote(id, req.user.sub);
  }

  @Delete(':id/vote')
  @UseGuards(AuthGuard('jwt'))
  unvote(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.reviewsService.unvote(id, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.reviewsService.update(id, dto, req.user.sub);
  }

  @Patch(':id/featured')
  @UseGuards(AuthGuard('jwt'))
  updateFeatured(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewFeaturedDto,
    @Request() req: { user: JwtPayload },
  ) {
    if (req.user.tipo !== 'admin')
      throw new ForbiddenException('Solo staff/admin');
    return this.reviewsService.updateFeatured(id, dto.featured);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.reviewsService.remove(id, req.user.sub);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { PatchUserReportDto, ReportUserDto } from './dto/user-report.dto';
import { SetShadowbanDto } from './dto/shadowban.dto';
import { SetBannedDto } from './dto/set-ban.dto';
import { ModeracionAuditService } from '../moderacion/moderacion-audit.service';
import { MailMetricsService } from '../mail/mail-metrics.service';
import { JikanProxyMetricsService } from '../jikan-proxy/jikan-proxy-metrics.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly service: UsersService,
    private readonly moderacionAudit: ModeracionAuditService,
    private readonly mailMetrics: MailMetricsService,
    private readonly jikanProxyMetrics: JikanProxyMetricsService,
  ) {}

  @Get('search')
  search(@Query('q') q: string) {
    return this.service.searchUsers(q ?? '', 10);
  }

  @Get('me/feed')
  @UseGuards(AuthGuard('jwt'))
  feed(@Request() req: { user: JwtPayload }) {
    return this.service.getFeed(req.user.sub, 30);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@Request() req: { user: JwtPayload }) {
    return this.service.getMe(req.user.sub);
  }

  @Get('me/export')
  @UseGuards(AuthGuard('jwt'))
  exportMyData(@Request() req: { user: JwtPayload }) {
    return this.service.exportData(req.user.sub);
  }

  @Delete('me')
  @UseGuards(AuthGuard('jwt'))
  deleteMyAccount(@Request() req: { user: JwtPayload }) {
    return this.service.deleteAccount(req.user.sub);
  }

  @Get('admin/user-reports')
  @UseGuards(AuthGuard('jwt'))
  listUserReports(@Request() req: { user: JwtPayload }) {
    return this.service.listUserReportsForAdmin(req.user.tipo);
  }

  @Patch('admin/user-reports/:reportId')
  @UseGuards(AuthGuard('jwt'))
  patchUserReport(
    @Param('reportId', ParseIntPipe) reportId: number,
    @Body() dto: PatchUserReportDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.setUserReportResolved(
      reportId,
      req.user.tipo,
      dto.resuelto,
      req.user.sub,
    );
  }

  @Get('admin/moderacion-log')
  @UseGuards(AuthGuard('jwt'))
  listModeracionLog(@Request() req: { user: JwtPayload }) {
    return this.moderacionAudit.listRecent(req.user.tipo);
  }

  /** Contadores en memoria de intentos SMTP (observabilidad operativa). */
  @Get('admin/mail-metrics')
  @UseGuards(AuthGuard('jwt'))
  getMailMetrics(@Request() req: { user: JwtPayload }) {
    if (req.user.tipo !== 'admin') throw new ForbiddenException();
    return this.mailMetrics.getSnapshot();
  }

  /** Contadores en memoria del proxy `/jikan/v4/*` (HIT/MISS + HTTP upstream). */
  @Get('admin/jikan-proxy-metrics')
  @UseGuards(AuthGuard('jwt'))
  getJikanProxyMetrics(@Request() req: { user: JwtPayload }) {
    if (req.user.tipo !== 'admin') throw new ForbiddenException();
    return this.jikanProxyMetrics.getSnapshot();
  }

  @Get('admin/lookup')
  @UseGuards(AuthGuard('jwt'))
  adminLookup(@Query('q') q: string, @Request() req: { user: JwtPayload }) {
    return this.service.adminLookupUsers(q ?? '', 15, req.user.tipo);
  }

  @Patch('admin/users/:userId/shadowban')
  @UseGuards(AuthGuard('jwt'))
  setShadowban(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: SetShadowbanDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.setShadowban(
      req.user.tipo,
      userId,
      dto.shadowbanned,
      req.user.sub,
    );
  }

  @Patch('admin/users/:userId/ban')
  @UseGuards(AuthGuard('jwt'))
  setBanned(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: SetBannedDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.setBanned(
      req.user.tipo,
      userId,
      dto.banned,
      req.user.sub,
    );
  }

  @Post(':id/report')
  @UseGuards(AuthGuard('jwt'))
  reportUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReportUserDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.reportUser(req.user.sub, id, dto.motivo);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  getProfile(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user?: JwtPayload },
  ) {
    const viewerId = req.user?.sub;
    return this.service.getPublicProfile(id, viewerId, req.user?.tipo);
  }

  @Get(':id/badges')
  @UseGuards(OptionalJwtAuthGuard)
  getBadges(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user?: JwtPayload },
  ) {
    return this.service.getBadges(id, req.user?.sub, req.user?.tipo);
  }

  @Get(':id/seguidores')
  @UseGuards(OptionalJwtAuthGuard)
  getFollowers(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user?: JwtPayload },
  ) {
    return this.service.getFollowers(id, req.user?.sub, req.user?.tipo);
  }

  @Get(':id/siguiendo')
  @UseGuards(OptionalJwtAuthGuard)
  getFollowing(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user?: JwtPayload },
  ) {
    return this.service.getFollowing(id, req.user?.sub, req.user?.tipo);
  }

  @Post(':id/seguir')
  @UseGuards(AuthGuard('jwt'))
  follow(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.follow(req.user.sub, id);
  }

  @Delete(':id/seguir')
  @UseGuards(AuthGuard('jwt'))
  unfollow(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.unfollow(req.user.sub, id);
  }
}

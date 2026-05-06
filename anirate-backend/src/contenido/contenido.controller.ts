import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContenidoService } from './contenido.service';
import { CreateContenidoDto } from './dto/contenido.dto';
import {
  PatchContenidoReportDto,
  ReportContenidoDto,
} from './dto/report-contenido.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('contenido')
export class ContenidoController {
  constructor(private readonly contenidoService: ContenidoService) {}

  @Get()
  findAll(@Query('tipo') tipo?: string, @Query('limit') limit?: string) {
    return this.contenidoService.findAll(tipo, limit ? +limit : 20);
  }

  @Get('top')
  findTop() {
    return this.contenidoService.findTop();
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.contenidoService.search(q ?? '');
  }

  @Get('admin/reports')
  @UseGuards(AuthGuard('jwt'))
  listContentReports(@Request() req: { user: JwtPayload }) {
    return this.contenidoService.listContenidoReportsForAdmin(req.user.tipo);
  }

  @Patch('admin/reports/:reportId')
  @UseGuards(AuthGuard('jwt'))
  patchContentReport(
    @Param('reportId', ParseIntPipe) reportId: number,
    @Body() dto: PatchContenidoReportDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.contenidoService.setContenidoReportResolved(
      reportId,
      req.user.tipo,
      dto.resuelto,
      req.user.sub,
    );
  }

  @Post('jikan/:jikanId/report')
  @UseGuards(AuthGuard('jwt'))
  reportContenido(
    @Param('jikanId', ParseIntPipe) jikanId: number,
    @Body() dto: ReportContenidoDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.contenidoService.reportContenido(
      jikanId,
      req.user.sub,
      dto,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contenidoService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreateContenidoDto) {
    return this.contenidoService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateContenidoDto>,
  ) {
    return this.contenidoService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contenidoService.remove(id);
  }
}

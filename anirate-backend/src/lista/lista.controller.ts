import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ListaService } from './lista.service';
import { UpsertListaDto, UpdateListaDto } from './dto/lista.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('lista')
export class ListaController {
  constructor(private readonly listaService: ListaService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  upsert(@Body() dto: UpsertListaDto, @Request() req: { user: JwtPayload }) {
    return this.listaService.upsert(dto, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListaDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.listaService.update(id, dto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.listaService.remove(id, req.user.sub);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  findMine(@Request() req: { user: JwtPayload }) {
    return this.listaService.findByUser(req.user.sub);
  }

  @Get('item')
  @UseGuards(AuthGuard('jwt'))
  findItem(
    @Query('jikanId', ParseIntPipe) jikanId: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.listaService.findItemByContenido(req.user.sub, jikanId);
  }
}

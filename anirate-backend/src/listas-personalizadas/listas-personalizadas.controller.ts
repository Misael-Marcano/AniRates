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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ListasPersonalizadasService } from './listas-personalizadas.service';
import {
  CreateListaPersonalizadaDto,
  UpdateListaPersonalizadaDto,
  AddItemDto,
} from './dto/lista-personalizada.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('listas')
export class ListasPersonalizadasController {
  constructor(private readonly service: ListasPersonalizadasService) {}

  @Get('publicas')
  listPublic(@Query('limit') limit?: string) {
    return this.service.listPublic(limit ? +limit : 20);
  }

  @Get('usuario/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: { user?: JwtPayload },
  ) {
    return this.service.findByUser(userId, req.user?.sub);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user?: JwtPayload },
  ) {
    return this.service.findById(id, req.user?.sub);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body() dto: CreateListaPersonalizadaDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.create(req.user.sub, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListaPersonalizadaDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.update(id, req.user.sub, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.remove(id, req.user.sub);
  }

  @Post(':id/items')
  @UseGuards(AuthGuard('jwt'))
  addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddItemDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.addItem(id, req.user.sub, dto);
  }

  @Delete(':id/items/:itemId')
  @UseGuards(AuthGuard('jwt'))
  removeItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Request() req: { user: JwtPayload },
  ) {
    return this.service.removeItem(id, itemId, req.user.sub);
  }
}

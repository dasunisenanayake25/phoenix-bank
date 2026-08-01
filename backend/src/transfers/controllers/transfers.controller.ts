import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateTransferDto } from '../dto/create-transfer.dto';
import { TransfersService } from '../services/transfers.service';

@Controller('api/v1/transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  async createTransfer(
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() dto: CreateTransferDto,
    @CurrentUser() user: { sub: string },
    @Req() req: { correlationId?: string },
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }
    return this.transfersService.createTransfer({
      userId: user.sub,
      idempotencyKey,
      dto,
      correlationId: req.correlationId,
    });
  }
}

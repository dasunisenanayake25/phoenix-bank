import {
  Body,
  Controller,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { AccountsService } from '../../accounts/accounts.service';

@Controller('api/payments')
export class TransfersController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('transfer')
  async createTransfer(
    @Body() body: { fromAccountId?: string | number; toAccountId?: string | number; amount?: number },
  ) {
    if (!body || !body.fromAccountId || !body.toAccountId || !body.amount) {
      throw new BadRequestException(
        'fromAccountId, toAccountId, and amount are required.',
      );
    }
    const result = await this.accountsService.processTransfer({
      fromAccountId: body.fromAccountId.toString(),
      toAccountId: body.toAccountId.toString(),
      amount: Number(body.amount),
    });
    return {
      status: 'success',
      message: 'Transfer executed successfully',
      data: result,
    };
  }
}

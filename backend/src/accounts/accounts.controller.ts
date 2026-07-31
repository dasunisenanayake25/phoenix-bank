import { Controller, Get, Param } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AccountsService } from './accounts.service';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get(':id/balance')
  async getBalance(@Param('id') id: string) {
    return this.accountsService.getBalance(id);
  }

  @EventPattern('transfer-initiated')
  async handleTransferInitiated(@Payload() message: any) {
    // The Kafka message is usually a parsed JSON object when emitted via NestJS ClientKafka
    const payload = typeof message === 'string' ? JSON.parse(message) : message;
    await this.accountsService.processTransfer({
      fromAccountId: payload.fromAccountId.toString(),
      toAccountId: payload.toAccountId.toString(),
      amount: Number(payload.amount),
    });
  }
}

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TransfersService } from '../transfers/services/transfers.service';

@Controller('api/v1/me/accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly transfersService: TransfersService,
  ) {}

  @Get()
  async getMyAccounts(@CurrentUser() user: { sub: string }) {
    return this.accountsService.getAccountsForUser(user.sub);
  }

  @Get(':accountId')
  async getAccount(
    @Param('accountId') accountId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.accountsService.getAccountForUser(accountId, user.sub);
  }

  @Get(':accountId/balance')
  async getBalance(
    @Param('accountId') accountId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.accountsService.getBalanceForUser(accountId, user.sub);
  }

  @Get(':accountId/transactions')
  async getTransactions(
    @Param('accountId') accountId: string,
    @CurrentUser() user: { sub: string },
  ) {
    await this.accountsService.getAccountForUser(accountId, user.sub);
    return [];
  }

  @EventPattern('transfer-initiated')
  async handleTransferInitiated(
    @Payload() message: string | Record<string, unknown>,
  ) {
    const payload =
      typeof message === 'string'
        ? (JSON.parse(message) as Record<string, unknown>)
        : message;
    const amountRaw = payload.amount;
    let amountMinor: string;
    if (typeof amountRaw === 'string' && /^\d+$/.test(amountRaw)) {
      amountMinor = amountRaw;
    } else {
      const major = Number(amountRaw);
      amountMinor = String(Math.round(major * 100));
    }
    await this.transfersService.processKafkaTransfer({
      fromAccountId: String(payload.fromAccountId),
      toAccountId: String(payload.toAccountId),
      amountMinor,
      currency: 'LKR',
      eventId:
        typeof payload.timestamp === 'string' ? payload.timestamp : undefined,
      userId: 'kafka-consumer',
    });
  }
}

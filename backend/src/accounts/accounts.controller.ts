import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AccountsService } from './accounts.service';

@Controller('api/accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async getMyAccounts() {
    return this.accountsService.getAllAccounts();
  }

  @Get(':accountId')
  async getAccount(@Param('accountId') accountId: string) {
    return this.accountsService.getAccount(accountId);
  }

  @Get(':accountId/balance')
  async getBalance(@Param('accountId') accountId: string) {
    return this.accountsService.getBalance(accountId);
  }

  @Get(':accountId/transactions')
  async getTransactions(@Param('accountId') accountId: string) {
    console.log(accountId);
    return [];
  }

  @EventPattern('transfer-initiated')
  async handleTransferInitiated(
    @Payload() message: string | Record<string, unknown>,
  ) {
    const payload =
      typeof message === 'string'
        ? (JSON.parse(message) as {
            fromAccountId: string | number;
            toAccountId: string | number;
            amount: string | number;
          })
        : (message as {
            fromAccountId: string | number;
            toAccountId: string | number;
            amount: string | number;
          });
    await this.accountsService.processTransfer({
      fromAccountId: payload.fromAccountId.toString(),
      toAccountId: payload.toAccountId.toString(),
      amount: Number(payload.amount),
    });
  }
}

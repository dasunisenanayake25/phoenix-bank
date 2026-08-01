import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('api/v1/me/accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly transfersService: TransfersService,
  ) {}

  @Get()
  async getMyAccounts() {
    // In a real DB, query accounts where customerId = user.id
    // For demo, we just get all and filter (or pretend)
    return this.accountsService.getAllAccounts();
  }

  async getAccount(@Param('accountId') accountId: string) {
    // Phase 2: Check account ownership (mock logic)
    // if (account.customerId !== user.id) throw ForbiddenException...
    return this.accountsService.getAccount(accountId);
  }

  async getBalance(@Param('accountId') accountId: string) {
    return this.accountsService.getBalance(accountId);
  }

  getTransactions(@Param('accountId') accountId: string) {
    console.log(accountId); // to avoid unused var
    return []; // Placeholder for transactions
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

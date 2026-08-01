import { Controller, Get, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../identity/entities/user.entity';

@Controller('api/v1/me/accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async getMyAccounts(@CurrentUser() user: any) {
    // In a real DB, query accounts where customerId = user.id
    // For demo, we just get all and filter (or pretend)
    return this.accountsService.getAllAccounts();
  }

  @Get(':accountId')
  async getAccount(@Param('accountId') accountId: string, @CurrentUser() user: any) {
    // Phase 2: Check account ownership (mock logic)
    // if (account.customerId !== user.id) throw ForbiddenException...
    return this.accountsService.getAccount(accountId);
  }

  @Get(':accountId/balance')
  async getBalance(@Param('accountId') accountId: string, @CurrentUser() user: any) {
    return this.accountsService.getBalance(accountId);
  }

  @Get(':accountId/transactions')
  async getTransactions(@Param('accountId') accountId: string, @CurrentUser() user: any) {
    return []; // Placeholder for transactions
  }

  @EventPattern('transfer-initiated')
  async handleTransferInitiated(@Payload() message: any) {
    const payload = typeof message === 'string' ? JSON.parse(message) : message;
    await this.accountsService.processTransfer({
      fromAccountId: payload.fromAccountId.toString(),
      toAccountId: payload.toAccountId.toString(),
      amount: Number(payload.amount),
    });
  }
}

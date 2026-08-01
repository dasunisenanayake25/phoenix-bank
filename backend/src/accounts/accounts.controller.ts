import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AccountsService } from './accounts.service';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('all')
  async getAllAccounts() {
    return this.accountsService.getAllAccounts();
  }

  @Get(':id/balance')
  async getBalance(@Param('id') id: string) {
    return this.accountsService.getBalance(id);
  }

  @Post('register')
  async register(@Body() body: { name: string; email: string; initialDeposit: number; currency?: string }) {
    return this.accountsService.registerAccount(body);
  }

  @Post('login')
  async login(@Body() body: { identifier: string }) {
    return this.accountsService.loginAccount(body.identifier);
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

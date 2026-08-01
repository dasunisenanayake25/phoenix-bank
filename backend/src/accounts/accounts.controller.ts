import { Controller, Get, Post, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AccountsService } from './accounts.service';
import { AuthGuard } from './auth.guard';
import { TokenService } from './token.service';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('all')
  async getAllAccounts() {
    return this.accountsService.getAllAccounts();
  }

  @UseGuards(AuthGuard)
  @Get(':id/balance')
  async getBalance(@Param('id') id: string, @Req() req: any) {
    if (req.user.id !== id) {
      throw new ForbiddenException("Forbidden resource: You cannot access another account's balance.");
    }
    return this.accountsService.getBalance(id);
  }

  @Post('register')
  async register(@Body() body: { name: string; email: string; password?: string; initialDeposit: number; currency?: string }) {
    const account = await this.accountsService.registerAccount(body);
    const token = await TokenService.generateToken({ id: account.id, name: account.holderName });
    return {
      id: account.id,
      customerId: account.customerId,
      holderName: account.holderName,
      email: account.email,
      balance: account.balance,
      currency: account.currency,
      accountType: account.accountType,
      status: account.status,
      token,
    };
  }

  @Post('login')
  async login(@Body() body: { identifier: string; password?: string }) {
    const account = await this.accountsService.loginAccount(body.identifier, body.password);
    const token = await TokenService.generateToken({ id: account.id, name: account.holderName });
    return {
      id: account.id,
      customerId: account.customerId,
      holderName: account.holderName,
      email: account.email,
      balance: account.balance,
      currency: account.currency,
      accountType: account.accountType,
      status: account.status,
      token,
    };
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

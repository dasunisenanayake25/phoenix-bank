import { Controller, Get, Param } from '@nestjs/common';
import { AccountsService } from './accounts.service';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get(':id/balance')
  async getBalance(@Param('id') id: string) {
    return this.accountsService.getBalance(id);
  }
}

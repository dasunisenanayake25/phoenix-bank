import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountType, AccountStatus } from './entities/account.entity';
import { AccountResponseDto } from './dto/account-response.dto';
import { AccountBalanceProjection } from '../ledger/entities/account-balance-projection.entity';
import { LedgerService } from '../ledger/ledger.service';
import { parseAmountMinor } from '../common/money/money';

@Injectable()
export class AccountsService implements OnModuleInit {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    @InjectRepository(AccountBalanceProjection)
    private readonly projectionRepository: Repository<AccountBalanceProjection>,
    private readonly ledgerService: LedgerService,
  ) {}

  async onModuleInit() {
    if (process.env.ENABLE_DEV_SEED !== 'true') {
      return;
    }
    try {
      console.log('Seeding initial bank accounts without passwords...');
      const userAcc = await this.accountsRepository.findOne({
        where: { id: '1' },
      });
      if (!userAcc) {
        await this.accountsRepository.save([
          {
            id: '1',
            holderName: 'User',
            balance: 150000.0,
            currency: 'LKR',
            accountType: AccountType.SAVINGS,
            status: AccountStatus.ACTIVE,
          },
          {
            id: '2',
            holderName: 'Amila',
            balance: 50000.0,
            currency: 'LKR',
            accountType: AccountType.SAVINGS,
            status: AccountStatus.ACTIVE,
          },
        ]);
        await this.ledgerService.ensureBalanceProjection('1', 15000000n);
        await this.ledgerService.ensureBalanceProjection('2', 5000000n);
      }
    } catch (err) {
      console.error('Failed to seed development accounts:', err);
    }
  }

  private assertOwnership(userId: string, accountId: string): void {
    if (userId === 'kafka-consumer') return;
    if (
      userId === accountId ||
      (userId === 'mock-uuid' && (accountId === '1' || accountId === '2'))
    ) {
      return;
    }
    throw new ForbiddenException('You do not own this account.');
  }

  async getAccountsForUser(userId: string): Promise<AccountResponseDto[]> {
    const accounts = await this.accountsRepository.find({
      order: { id: 'ASC' },
    });
    const owned = accounts.filter(
      (acc) =>
        userId === acc.id ||
        (userId === 'mock-uuid' && (acc.id === '1' || acc.id === '2')),
    );
    return Promise.all(owned.map((acc) => this.toResponseDto(acc)));
  }

  async getAllAccounts(): Promise<AccountResponseDto[]> {
    const accounts = await this.accountsRepository.find({
      order: { id: 'ASC' },
    });
    return accounts.map((acc) => new AccountResponseDto(acc));
  }

  async processTransfer(data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
  }) {
    console.log('Processing transfer event in Accounts Ledger:', data);

    const fromAccount = await this.accountsRepository.findOne({
      where: { id: data.fromAccountId },
    });
    const toAccount = await this.accountsRepository.findOne({
      where: { id: data.toAccountId },
    });

    if (fromAccount && toAccount) {
      if (Number(fromAccount.balance) >= data.amount) {
        fromAccount.balance = Number(fromAccount.balance) - data.amount;
        toAccount.balance = Number(toAccount.balance) + data.amount;

        await this.accountsRepository.save([fromAccount, toAccount]);
        console.log(`Transfer of ${data.amount} successful!`);
      } else {
        console.error('Insufficient funds for transfer');
      }
    } else {
      console.error('One or both accounts not found');
    }
    return this.toResponseDto(account);
  }

  async getBalance(id: string): Promise<AccountResponseDto> {
    return this.getAccount(id);
  }

  private async toResponseDto(account: Account): Promise<AccountResponseDto> {
    const projection = await this.projectionRepository.findOne({
      where: { accountId: account.id },
    });
    const balanceMinor =
      projection?.availableBalanceMinor ?? account.balance?.toString() ?? '0';
    return new AccountResponseDto({
      ...account,
      balance: Number(parseAmountMinor(balanceMinor)),
    });
  }
}

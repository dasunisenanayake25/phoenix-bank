import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
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
      const userAcc = await this.accountsRepository.findOne({
        where: { id: '1' },
      });
      if (!userAcc) {
        await this.accountsRepository.save([
          {
            id: '1',
            holderName: 'User',
            balance: 15000000,
            currency: 'LKR',
            accountType: AccountType.SAVINGS,
            status: AccountStatus.ACTIVE,
          },
          {
            id: '2',
            holderName: 'Amila',
            balance: 5000000,
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

  async getAccountForUser(
    id: string,
    userId: string,
  ): Promise<AccountResponseDto> {
    this.assertOwnership(userId, id);
    return this.getAccount(id);
  }

  async getBalanceForUser(
    id: string,
    userId: string,
  ): Promise<AccountResponseDto> {
    this.assertOwnership(userId, id);
    return this.getBalance(id);
  }

  async getAccount(id: string): Promise<AccountResponseDto> {
    const account = await this.accountsRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException('Account not found');
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

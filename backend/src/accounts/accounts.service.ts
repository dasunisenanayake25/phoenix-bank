import { Injectable, NotFoundException, OnModuleInit, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountType, AccountStatus } from './entities/account.entity';
import { AccountResponseDto } from './dto/account-response.dto';

@Injectable()
export class AccountsService implements OnModuleInit {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
  ) {}

  async onModuleInit() {
    try {
      console.log('Seeding initial bank accounts without passwords...');
      const userAcc = await this.accountsRepository.findOne({ where: { id: '1' } });
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
        console.log('Initial accounts seeded successfully!');
      }
    } catch (err) {
      console.error('Failed to seed initial accounts:', err);
    }
  }

  async getAccount(id: string): Promise<AccountResponseDto> {
    const account = await this.accountsRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return new AccountResponseDto(account);
  }

  async getBalance(id: string): Promise<AccountResponseDto> {
    return this.getAccount(id); // Same for now in Phase 2
  }

  async getAllAccounts(): Promise<AccountResponseDto[]> {
    const accounts = await this.accountsRepository.find({ order: { id: 'ASC' } });
    return accounts.map(acc => new AccountResponseDto(acc));
  }

  async processTransfer(data: { fromAccountId: string; toAccountId: string; amount: number }) {
    console.log('Processing transfer event in Accounts Ledger:', data);
    
    const fromAccount = await this.accountsRepository.findOne({ where: { id: data.fromAccountId } });
    const toAccount = await this.accountsRepository.findOne({ where: { id: data.toAccountId } });

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
  }
}

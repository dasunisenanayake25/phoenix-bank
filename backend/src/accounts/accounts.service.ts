import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountType, AccountStatus } from './entities/account.entity';

@Injectable()
export class AccountsService implements OnModuleInit {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
  ) {}

  async onModuleInit() {
    try {
      console.log('Seeding initial bank accounts if not present...');
      const userAcc = await this.accountsRepository.findOne({ where: { id: '1' } });
      if (!userAcc) {
        await this.accountsRepository.save([
          {
            id: '1',
            customerId: 'cust-user-100',
            balance: 150000.00,
            currency: 'LKR',
            accountType: AccountType.SAVINGS,
            status: AccountStatus.ACTIVE,
          },
          {
            id: '2',
            customerId: 'cust-amila-101',
            balance: 50000.00,
            currency: 'LKR',
            accountType: AccountType.SAVINGS,
            status: AccountStatus.ACTIVE,
          },
          {
            id: '3',
            customerId: 'cust-kamal-102',
            balance: 75000.00,
            currency: 'LKR',
            accountType: AccountType.SAVINGS,
            status: AccountStatus.ACTIVE,
          },
        ]);
        console.log('Initial accounts (1, 2, 3) seeded successfully!');
      }
    } catch (err) {
      console.error('Failed to seed initial accounts:', err);
    }
  }

  async getBalance(id: string): Promise<{ balance: number; currency: string }> {
    const account = await this.accountsRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return { balance: Number(account.balance), currency: account.currency };
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
        console.log(`Transfer of ${data.amount} successful! New balance for account 1: ${fromAccount.balance}`);
      } else {
        console.error('Insufficient funds for transfer');
      }
    } else {
      console.error('One or both accounts not found');
    }
  }
}

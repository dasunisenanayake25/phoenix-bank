import { Injectable, NotFoundException, OnModuleInit, BadRequestException, UnauthorizedException } from '@nestjs/common';
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
            holderName: 'User',
            email: 'user@phoenixbank.com',
            password: '123',
            balance: 150000.00,
            currency: 'LKR',
            accountType: AccountType.SAVINGS,
            status: AccountStatus.ACTIVE,
          },
          {
            id: '2',
            customerId: 'cust-amila-101',
            holderName: 'Amila',
            email: 'amila@phoenixbank.com',
            password: '123',
            balance: 50000.00,
            currency: 'LKR',
            accountType: AccountType.SAVINGS,
            status: AccountStatus.ACTIVE,
          },
          {
            id: '3',
            customerId: 'cust-kamal-102',
            holderName: 'Kamal',
            email: 'kamal@phoenixbank.com',
            password: '123',
            balance: 75000.00,
            currency: 'LKR',
            accountType: AccountType.SAVINGS,
            status: AccountStatus.ACTIVE,
          },
        ]);
        console.log('Initial accounts (1, 2, 3) seeded successfully with default passwords!');
      }
    } catch (err) {
      console.error('Failed to seed initial accounts:', err);
    }
  }

  async getBalance(id: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return account;
  }

  async getAllAccounts(): Promise<Account[]> {
    return this.accountsRepository.find({ order: { id: 'ASC' } });
  }

  async registerAccount(data: { name: string; email: string; password?: string; initialDeposit?: number; currency?: string }): Promise<Account> {
    if (!data.name) {
      throw new BadRequestException('Name is required.');
    }

    const count = await this.accountsRepository.count();
    const nextId = (count + 1000).toString();

    const newAccount = this.accountsRepository.create({
      id: nextId,
      customerId: `cust-${Date.now()}`,
      holderName: data.name,
      email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '')}@phoenixbank.com`,
      password: data.password || '123',
      balance: data.initialDeposit != null ? Number(data.initialDeposit) : 0.00,
      currency: data.currency || 'LKR',
      accountType: AccountType.SAVINGS,
      status: AccountStatus.ACTIVE,
    });

    const saved = await this.accountsRepository.save(newAccount);
    console.log('New member registered with password:', saved.holderName);
    return saved;
  }

  async loginAccount(identifier: string, password?: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: [
        { id: identifier },
        { email: identifier },
        { holderName: identifier }
      ]
    });

    if (!account) {
      throw new NotFoundException(`No account found matching '${identifier}'`);
    }

    // Verify password if provided
    if (password && account.password && account.password !== password) {
      throw new UnauthorizedException('Incorrect password. Please try again.');
    }

    return account;
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

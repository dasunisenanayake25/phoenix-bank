import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
  ) {}

  async getBalance(id: string): Promise<{ balance: number; currency: string }> {
    const account = await this.accountsRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return { balance: Number(account.balance), currency: account.currency };
  }

  async processTransfer(data: { fromAccountId: string; toAccountId: string; amount: number }) {
    console.log('Processing transfer event in Accounts Ledger:', data);
    
    // In a real application, this should be done within a strict database transaction
    // with pessimistic locking to prevent race conditions.
    const fromAccount = await this.accountsRepository.findOne({ where: { id: data.fromAccountId } });
    const toAccount = await this.accountsRepository.findOne({ where: { id: data.toAccountId } });

    if (fromAccount && toAccount) {
      if (Number(fromAccount.balance) >= data.amount) {
        fromAccount.balance = Number(fromAccount.balance) - data.amount;
        toAccount.balance = Number(toAccount.balance) + data.amount;
        
        await this.accountsRepository.save([fromAccount, toAccount]);
        console.log(`Transfer of ${data.amount} successful!`);
        // Here we would emit 'transfer-settled' event back to Kafka
      } else {
        console.error('Insufficient funds for transfer');
      }
    } else {
      console.error('One or both accounts not found');
    }
  }
}

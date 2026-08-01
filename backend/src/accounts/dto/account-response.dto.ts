import {
  AccountStatus,
  AccountType,
  Account,
} from '../entities/account.entity';

export class AccountResponseDto {
  id: string;
  holderName: string;
  balance: number;
  currency: string;
  accountType: AccountType;
  status: AccountStatus;

  constructor(partial: Partial<Account>) {
    this.id = partial.id!;
    this.holderName = partial.holderName!;
    this.balance = partial.balance!;
    this.currency = partial.currency!;
    this.accountType = partial.accountType!;
    this.status = partial.status!;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  assertBalancedEntries,
  LedgerAccountType,
  LedgerEntryDirection,
  LedgerEntryDraft,
  LedgerTransactionStatus,
} from './ledger.enums';
import { LedgerAccount } from './entities/ledger-account.entity';
import { LedgerTransaction } from './entities/ledger-transaction.entity';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { AccountBalanceProjection } from './entities/account-balance-projection.entity';
import { parseAmountMinor, subtractMinor } from '../common/money/money';

export type PostTransferParams = {
  reference: string;
  fromAccountId: string;
  toAccountId: string;
  amountMinor: bigint;
  currency: string;
  createdBy?: string;
  description?: string;
};

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(LedgerAccount)
    private readonly ledgerAccountRepo: Repository<LedgerAccount>,
    @InjectRepository(LedgerTransaction)
    private readonly ledgerTransactionRepo: Repository<LedgerTransaction>,
    @InjectRepository(LedgerEntry)
    private readonly ledgerEntryRepo: Repository<LedgerEntry>,
    @InjectRepository(AccountBalanceProjection)
    private readonly projectionRepo: Repository<AccountBalanceProjection>,
  ) {}

  async ensureLedgerAccountForBankAccount(
    bankAccountId: string,
    currency: string,
    manager?: EntityManager,
  ): Promise<LedgerAccount> {
    const repo = manager
      ? manager.getRepository(LedgerAccount)
      : this.ledgerAccountRepo;
    const code = `CUST-LIAB-${bankAccountId}`;
    let account = await repo.findOne({ where: { code } });
    if (!account) {
      account = repo.create({
        code,
        name: `Customer liability ${bankAccountId}`,
        type: LedgerAccountType.LIABILITY,
        currency,
        bankAccountId,
      });
      account = await repo.save(account);
    }
    return account;
  }

  async ensureBalanceProjection(
    accountId: string,
    initialMinor: bigint,
    manager?: EntityManager,
  ): Promise<AccountBalanceProjection> {
    const repo = manager
      ? manager.getRepository(AccountBalanceProjection)
      : this.projectionRepo;
    let projection = await repo.findOne({ where: { accountId } });
    if (!projection) {
      const initial = initialMinor.toString();
      projection = repo.create({
        accountId,
        ledgerBalanceMinor: initial,
        availableBalanceMinor: initial,
        heldAmountMinor: '0',
      });
      projection = await repo.save(projection);
    }
    return projection;
  }

  buildTransferEntries(
    fromLedgerAccountId: string,
    toLedgerAccountId: string,
    amountMinor: bigint,
    currency: string,
  ): LedgerEntryDraft[] {
    const entries: LedgerEntryDraft[] = [
      {
        ledgerAccountId: fromLedgerAccountId,
        direction: LedgerEntryDirection.DEBIT,
        amountMinor,
        currency,
      },
      {
        ledgerAccountId: toLedgerAccountId,
        direction: LedgerEntryDirection.CREDIT,
        amountMinor,
        currency,
      },
    ];
    assertBalancedEntries(entries);
    return entries;
  }

  async postInternalTransfer(
    manager: EntityManager,
    params: PostTransferParams,
  ): Promise<LedgerTransaction> {
    const amountMinor = params.amountMinor;

    const projectionRepo = manager.getRepository(AccountBalanceProjection);
    const fromProjection = await projectionRepo.findOne({
      where: { accountId: params.fromAccountId },
      lock: { mode: 'pessimistic_write' },
    });
    const toProjection = await projectionRepo.findOne({
      where: { accountId: params.toAccountId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!fromProjection || !toProjection) {
      throw new Error('Balance projection not found');
    }

    const available = parseAmountMinor(fromProjection.availableBalanceMinor);
    const nextAvailable = subtractMinor(available, amountMinor);
    fromProjection.availableBalanceMinor = nextAvailable.toString();
    fromProjection.ledgerBalanceMinor = nextAvailable.toString();

    const toAvailable = parseAmountMinor(toProjection.availableBalanceMinor);
    const toNext = toAvailable + amountMinor;
    toProjection.availableBalanceMinor = toNext.toString();
    toProjection.ledgerBalanceMinor = toNext.toString();

    await projectionRepo.save([fromProjection, toProjection]);

    const fromLedger = await this.ensureLedgerAccountForBankAccount(
      params.fromAccountId,
      params.currency,
      manager,
    );
    const toLedger = await this.ensureLedgerAccountForBankAccount(
      params.toAccountId,
      params.currency,
      manager,
    );

    const entries = this.buildTransferEntries(
      fromLedger.id,
      toLedger.id,
      amountMinor,
      params.currency,
    );

    const txRepo = manager.getRepository(LedgerTransaction);
    const entryRepo = manager.getRepository(LedgerEntry);

    const tx = txRepo.create({
      reference: params.reference,
      transactionType: 'INTERNAL_TRANSFER',
      status: LedgerTransactionStatus.POSTED,
      description: params.description ?? null,
      createdBy: params.createdBy ?? null,
      effectiveAt: new Date(),
      reversalOfTransactionId: null,
    });
    const savedTx = await txRepo.save(tx);

    for (const draft of entries) {
      const entry = entryRepo.create({
        id: randomUUID(),
        ledgerTransactionId: savedTx.id,
        ledgerAccountId: draft.ledgerAccountId,
        direction: draft.direction,
        amountMinor: draft.amountMinor.toString(),
        currency: draft.currency,
      });
      await entryRepo.save(entry);
    }

    return savedTx;
  }
}

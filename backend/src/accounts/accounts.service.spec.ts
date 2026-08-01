import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccountsService } from './accounts.service';
import { Account } from './entities/account.entity';
import { AccountBalanceProjection } from '../ledger/entities/account-balance-projection.entity';
import { LedgerService } from '../ledger/ledger.service';

describe('AccountsService', () => {
  let service: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AccountBalanceProjection),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: LedgerService,
          useValue: {
            ensureBalanceProjection: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

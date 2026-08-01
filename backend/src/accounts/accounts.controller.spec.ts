import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { TransfersService } from '../transfers/services/transfers.service';

describe('AccountsController', () => {
  let controller: AccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        {
          provide: AccountsService,
          useValue: {
            getAccountsForUser: jest.fn(),
            getAccountForUser: jest.fn(),
            getBalanceForUser: jest.fn(),
          },
        },
        {
          provide: TransfersService,
          useValue: {
            processKafkaTransfer: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

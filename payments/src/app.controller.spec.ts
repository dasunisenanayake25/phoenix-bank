import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: 'KAFKA_SERVICE',
          useValue: {
            emit: jest.fn(),
            subscribeToResponseOf: jest.fn(),
            connect: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should validate amount', () => {
      const req = { user: { id: '1', name: 'Test' }, headers: {} };
      const result = appController.transferFunds(
        { fromAccountId: 1, toAccountId: 2, amount: 0 },
        req,
      );
      expect(result.status).toBe('error');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { KeyCeremonyService } from './key-ceremony.service';
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as sss from 'shamirs-secret-sharing';

describe('KeyCeremonyService', () => {
  let service: KeyCeremonyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeyCeremonyService],
    }).compile();

    service = module.get<KeyCeremonyService>(KeyCeremonyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully reconstruct key and sign with 3 valid shares', () => {
    const masterKey = crypto.randomBytes(32);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const shares = sss.split(masterKey, { shares: 5, threshold: 3 });

    const result = service.reconstructAndSign([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      shares[0].toString('hex'),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      shares[1].toString('hex'),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      shares[2].toString('hex'),
    ]);
    expect(result.success).toBe(true);
    expect(result.signedEntries).toBe(12);
  });

  it('should fail with less than 3 shares', () => {
    const masterKey = crypto.randomBytes(32);
    const shares = sss.split(masterKey, { shares: 5, threshold: 3 });
    const shareHexes = [shares[0].toString('hex'), shares[1].toString('hex')];

    expect(() => service.reconstructAndSign(shareHexes)).toThrow(
      BadRequestException,
    );
  });

  it('should fail with invalid shares', () => {
    const shareHexes = ['invalid1', 'invalid2', 'invalid3'];
    expect(() => service.reconstructAndSign(shareHexes)).toThrow(
      BadRequestException,
    );
  });
});

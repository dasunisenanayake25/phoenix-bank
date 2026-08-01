import { Module } from '@nestjs/common';
import { KeyCeremonyService } from './key-ceremony.service';
import { KeyCeremonyController } from './key-ceremony.controller';

@Module({
  providers: [KeyCeremonyService],
  controllers: [KeyCeremonyController],
})
export class KeyCeremonyModule {}

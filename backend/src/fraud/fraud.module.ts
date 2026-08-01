import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FraudCase } from './entities/fraud-case.entity';
import { FraudEngineService } from './services/fraud-engine.service';
import { FraudAdminController } from './controllers/fraud-admin.controller';
import { Transfer } from '../transfers/entities/transfer.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([FraudCase, Transfer]), AuditModule],
  controllers: [FraudAdminController],
  providers: [FraudEngineService],
  exports: [FraudEngineService],
})
export class FraudModule {}

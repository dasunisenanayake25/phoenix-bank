import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../identity/entities/user.entity';
import { FraudCase } from '../entities/fraud-case.entity';
import { Transfer } from '../../transfers/entities/transfer.entity';
import { TransferStatus } from '../../transfers/transfers.enums';
import { AuditService } from '../../audit/audit.service';

class ReviewDto {
  reason: string;
}

@Controller('api/v1/admin/fraud/cases')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.FRAUD_ANALYST, UserRole.ADMIN)
export class FraudAdminController {
  constructor(
    @InjectRepository(FraudCase)
    private readonly fraudCaseRepo: Repository<FraudCase>,
    @InjectRepository(Transfer)
    private readonly transferRepo: Repository<Transfer>,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  listCases() {
    return this.fraudCaseRepo.find({
      order: { evaluatedAt: 'DESC' },
      take: 100,
    });
  }

  @Get(':id')
  getCase(@Param('id') id: string) {
    return this.fraudCaseRepo.findOne({ where: { id } });
  }

  @Post(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() body: ReviewDto,
    @CurrentUser() user: { sub: string },
  ) {
    const fraudCase = await this.fraudCaseRepo.findOne({ where: { id } });
    if (!fraudCase) {
      return null;
    }
    if (fraudCase.initiatedBy && fraudCase.initiatedBy === user.sub) {
      throw new ForbiddenException(
        'Maker-checker violation: initiator cannot approve',
      );
    }
    await this.transferRepo.update(fraudCase.transferId, {
      status: TransferStatus.APPROVED,
    });
    fraudCase.reviewedBy = user.sub;
    fraudCase.reviewDecision = 'APPROVED';
    fraudCase.reviewReason = body.reason;
    await this.fraudCaseRepo.save(fraudCase);
    await this.auditService.record({
      actorType: 'USER',
      actorId: user.sub,
      action: 'FRAUD_CASE_APPROVED',
      targetType: 'FRAUD_CASE',
      targetId: id,
      result: 'SUCCESS',
    });
    return { status: 'approved' };
  }

  @Post(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() body: ReviewDto,
    @CurrentUser() user: { sub: string },
  ) {
    const fraudCase = await this.fraudCaseRepo.findOne({ where: { id } });
    if (!fraudCase) {
      return null;
    }
    if (fraudCase.initiatedBy && fraudCase.initiatedBy === user.sub) {
      throw new ForbiddenException(
        'Maker-checker violation: initiator cannot reject',
      );
    }
    await this.transferRepo.update(fraudCase.transferId, {
      status: TransferStatus.REJECTED,
    });
    fraudCase.reviewedBy = user.sub;
    fraudCase.reviewDecision = 'REJECTED';
    fraudCase.reviewReason = body.reason;
    await this.fraudCaseRepo.save(fraudCase);
    await this.auditService.record({
      actorType: 'USER',
      actorId: user.sub,
      action: 'FRAUD_CASE_REJECTED',
      targetType: 'FRAUD_CASE',
      targetId: id,
      result: 'SUCCESS',
    });
    return { status: 'rejected' };
  }
}

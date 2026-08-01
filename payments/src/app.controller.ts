import {
  Controller,
  Post,
  Body,
  Inject,
  OnModuleInit,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { AuthGuard } from './auth.guard';

@Controller('payments')
export class AppController implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('transfer-initiated');
    await this.kafkaClient.connect();
  }

  @UseGuards(AuthGuard)
  @Post('transfer')
  async transferFunds(
    @Body()
    transferDto: { fromAccountId: number; toAccountId: number; amount: number },
    @Req() req: any,
  ) {
    // Prevent Broken Object Level Authorization (BOLA)
    if (req.user.id !== transferDto.fromAccountId.toString()) {
      throw new ForbiddenException(
        "Forbidden resource: You cannot transfer funds from another user's account.",
      );
    }

    // 1. Validate request
    if (transferDto.amount <= 0) {
      return { status: 'error', message: 'Amount must be greater than zero' };
    }

    // 2. Emit event to Kafka Event Bus
    this.kafkaClient.emit(
      'transfer-initiated',
      JSON.stringify({
        ...transferDto,
        timestamp: new Date().toISOString(),
      }),
    );

    // 3. Return immediate response (Event-Driven Asynchronous pattern)
    return {
      status: 'pending',
      message: 'Transfer initiated and sent for processing',
      data: transferDto,
    };
  }
}

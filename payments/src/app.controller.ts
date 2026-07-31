import { Controller, Post, Body, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Controller('payments')
export class AppController implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('transfer-initiated');
    await this.kafkaClient.connect();
  }

  @Post('transfer')
  async transferFunds(@Body() transferDto: { fromAccountId: number; toAccountId: number; amount: number }) {
    // 1. Validate request (mocked)
    if (transferDto.amount <= 0) {
      return { status: 'error', message: 'Amount must be greater than zero' };
    }

    // 2. Emit event to Kafka Event Bus
    this.kafkaClient.emit('transfer-initiated', JSON.stringify({
      ...transferDto,
      timestamp: new Date().toISOString(),
    }));

    // 3. Return immediate response (Event-Driven Asynchronous pattern)
    return {
      status: 'pending',
      message: 'Transfer initiated and sent for processing',
      data: transferDto
    };
  }
}

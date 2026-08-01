import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { OutboxPublisherService } from './outbox/outbox-publisher.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Configure Kafka Consumer
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: kafkaBrokers,
      },
      consumer: {
        groupId: process.env.KAFKA_CONSUMER_GROUP ?? 'accounts-consumer-group',
      },
    },
  });

  await app.startAllMicroservices();
  app.get(OutboxPublisherService).startPolling(5000);

  const port = process.env.PORT ?? 4001;
  await app.listen(port);
  console.log(`Accounts Microservice is running on port ${port}`);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

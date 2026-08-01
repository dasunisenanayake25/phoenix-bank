import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { OutboxPublisherService } from './outbox/outbox-publisher.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(','),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const kafkaBrokers = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(
    ',',
  );
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
void bootstrap();

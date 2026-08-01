import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountsModule } from './accounts/accounts.module';
import { IdentityModule } from './identity/identity.module';
import { CustomersModule } from './customers/customers.module';
import { TransfersModule } from './transfers/transfers.module';
import { LedgerModule } from './ledger/ledger.module';
import { OutboxModule } from './outbox/outbox.module';
import { HealthController } from './health/health.controller';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { SafeHttpExceptionFilter } from './common/filters/safe-http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        let dbPassword = configService.get<string>(
          'DB_PASSWORD',
          'postgrespassword',
        );

        // Attempt to load database password dynamically from Vault
        try {
          const vaultUrl = process.env.VAULT_ADDR || 'http://localhost:8200';
          const vaultToken = process.env.VAULT_TOKEN || 'phoenix-master-token';

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1500);

          const res = await fetch(`${vaultUrl}/v1/secret/data/phoenix/ledger`, {
            headers: { 'X-Vault-Token': vaultToken },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = (await res.json()) as {
              data?: { data?: Record<string, string> };
            };
            const secrets = data?.data?.data ?? {};
            if (secrets['DB_PASSWORD']) {
              dbPassword = secrets['DB_PASSWORD'];
              console.log(
                'Successfully loaded DB_PASSWORD from HashiCorp Vault.',
              );
            }
          }
        } catch {
          console.warn(
            'Vault unavailable or sealed. Using default database password.',
          );
        }

        const isProduction = process.env.NODE_ENV === 'production';

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5433),
          username: configService.get<string>('DB_USER', 'postgres'),
          password: dbPassword,
          database: configService.get<string>('DB_NAME', 'phoenix_ledger'),
          autoLoadEntities: true,
          synchronize: !isProduction,
        };
      },
      inject: [ConfigService],
    }),
    AccountsModule,
    IdentityModule,
    CustomersModule,
    LedgerModule,
    TransfersModule,
    OutboxModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: SafeHttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}

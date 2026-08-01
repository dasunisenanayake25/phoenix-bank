import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountsModule } from './accounts/accounts.module';
<<<<<<< HEAD
=======
import { KeyCeremonyModule } from './key-ceremony/key-ceremony.module';
>>>>>>> 68a2d6c02c964faad59ad73411bf680c32d82355

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5433),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgrespassword'),
        database: configService.get<string>('DB_NAME', 'phoenix_ledger'),
        autoLoadEntities: true,
        synchronize: true, // Development only!
      }),
      inject: [ConfigService],
    }),
    AccountsModule,
<<<<<<< HEAD
=======
    KeyCeremonyModule,
>>>>>>> 68a2d6c02c964faad59ad73411bf680c32d82355
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

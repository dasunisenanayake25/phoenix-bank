import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateTransferDto {
  @IsString()
  @Length(1, 64)
  fromAccountId: string;

  @IsString()
  @Length(1, 64)
  toAccountId: string;

  @IsString()
  @Matches(/^\d+$/)
  amountMinor: string;

  @IsString()
  @Length(3, 3)
  currency: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;
}

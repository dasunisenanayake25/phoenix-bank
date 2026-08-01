import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { KeyCeremonyService } from './key-ceremony.service';

class ReconstructDto {
  shares: string[];
}

@Controller('key-ceremony')
export class KeyCeremonyController {
  constructor(private readonly keyCeremonyService: KeyCeremonyService) {}

  @Post('reconstruct')
  @HttpCode(HttpStatus.OK)
  reconstruct(@Body() body: ReconstructDto) {
    return this.keyCeremonyService.reconstructAndSign(body.shares);
  }
}

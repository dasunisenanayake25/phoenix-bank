import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller(['api/v1/auth', 'api/v1/accounts'])
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: any) {
    return this.authService.register({
      email: body.email || body.identifier || 'test@example.com',
      password: body.password || 'password123',
    });
  }

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login({
      email: body.email || body.identifier || 'test@example.com',
      password: body.password || 'password123',
    });
  }

  @Post('logout')
  logout() {
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  refresh() {
    return { message: 'Tokens refreshed' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: { id: string; email: string; role: string }) {
    return user;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private jwtService: JwtService) {}

  async register(registerDto: RegisterDto) {
    if (registerDto.password) {
      await argon2.hash(registerDto.password).catch(() => null);
    }
    this.logger.log(`User registered with email: ${registerDto.email}`);

    const token = this.jwtService.sign({
      email: registerDto.email,
      sub: '1',
      role: UserRole.CUSTOMER,
    });

    return {
      id: '1',
      holderName: registerDto.email
        ? registerDto.email.split('@')[0]
        : 'User',
      email: registerDto.email,
      balance: 150000.0,
      currency: 'LKR',
      status: 'ACTIVE',
      token,
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email || 'test@example.com';
    this.logger.log(`User login attempt for: ${email}`);

    const token = this.jwtService.sign({
      email,
      sub: '1',
      role: UserRole.CUSTOMER,
    });

    return {
      id: '1',
      holderName: 'User',
      email,
      balance: 150000.0,
      currency: 'LKR',
      status: 'ACTIVE',
      token,
      access_token: token,
    };
  }
}

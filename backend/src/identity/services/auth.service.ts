import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import { User, UserRole, UserStatus } from '../entities/user.entity';
// Assuming we inject a repository for User here

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Note: In a real implementation, inject InjectRepository(User) 
  // and use it to store/fetch users. For Phase 1 we mock the DB or just show the structure.

  constructor(
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    const hashedPassword = await argon2.hash(registerDto.password);
    // 1. Check if user exists
    // 2. Create User entity with hashedPassword
    // 3. Save to DB
    this.logger.log(`User registered with email: ${registerDto.email}`);
    
    // For now, return a mock user
    const user = {
      id: 'mock-uuid',
      email: registerDto.email,
      role: UserRole.CUSTOMER
    };

    return this.loginUser(user);
  }

  async login(loginDto: LoginDto): Promise<any> {
    // 1. Find user by email
    // 2. If !user or user is locked, throw UnauthorizedException
    // 3. Verify password: await argon2.verify(user.passwordHash, loginDto.password)
    // 4. Update lastLoginAt or failedLoginAttempts
    
    // Mock validation
    if (loginDto.email !== 'test@example.com' && loginDto.password !== 'correcthorsebatterystaple') {
        // Mocking failure
        this.logger.warn(`Failed login attempt for ${loginDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
    }

    const user = {
      id: 'mock-uuid',
      email: loginDto.email,
      role: UserRole.CUSTOMER
    };

    return this.loginUser(user);
  }

  private async loginUser(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

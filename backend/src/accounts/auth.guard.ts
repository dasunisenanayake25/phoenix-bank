import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from './token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { id: string; name: string };
    }>();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication token is required.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = await TokenService.verifyToken(token);
    if (!decoded) {
      throw new UnauthorizedException(
        'Invalid or expired authentication token.',
      );
    }

    request.user = decoded;
    return true;
  }
}

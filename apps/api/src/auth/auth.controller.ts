import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { AuthenticatedUser } from './jwt.strategy';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('socket-token')
  @UseGuards(JwtAuthGuard)
  getSocketToken(@CurrentUser() user: AuthenticatedUser) {
    const token = this.authService.createSocketToken(user._id.toString());
    return { token };
  }
}

import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/models/user.entity';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  PickType,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { SendVerificationCodeDto } from './dto/verificationCode.dto';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({ type: User, description: 'Registered user' })
  @ApiBadRequestResponse({ description: 'Invalid register data' })
  @ApiConflictResponse({ description: 'User with given email already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.authService.register(registerDto);
  }

  @Post('send-verification-code')
  @ApiCreatedResponse({ type: SendVerificationCodeDto, description: 'Send Verification Code to User' })
  @ApiBadRequestResponse({ description: 'Invalid Email' })
  @ApiConflictResponse({ description: 'User with given email already exists' })
  async sendVerificationCode(@Body() codeDto: SendVerificationCodeDto): Promise<SendVerificationCodeDto> {
    return this.authService.sendVerificationCode(codeDto);
  }

  @Post('verify-code')
  @ApiCreatedResponse({ type: SendVerificationCodeDto, description: 'Send Verification Code to User' })
  @ApiBadRequestResponse({ description: 'Invalid Email' })
  @ApiConflictResponse({ description: 'User with given email does not exists' })
  async verifyCode(@Body() codeDto: SendVerificationCodeDto, @Req() req: Request, @Res() res: Response) {
    // First, verify the code
    const verificationResult = await this.authService.verifyCode(codeDto);
    // Find the user after verification
    const user = await this.authService['usersService'].findUserByEmail(codeDto.email);
    if (!user) {
      return res.status(400).json({ message: 'User not found after verification' });
    }
    // Auto-login the user
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Login failed' });
      }
      // Now the session cookie is set!
      return res.json({ message: 'Verified and logged in', user });
    });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({
    type: PickType(User, ['id', 'firstName', 'email', 'role']),
    description: 'Logged in user',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(
    @Req() req: Request,
  ): Promise<Pick<User, 'id' | 'firstName' | 'email' | 'role'>> {
    return new Promise((resolve, reject) => {
      req.login(req.user, (err) => {
        if (err) return reject(err);
        resolve(req.user as User);
      });
    });
  }

  @UseGuards(SessionAuthGuard)
  @Post('logout')
  @ApiCreatedResponse({ description: 'User logged out' })
  @ApiUnauthorizedResponse({ description: 'User is not logged in' })
  async logout(@Req() req: Request): Promise<void> {
    req.logOut(() => {
      req.session.cookie.maxAge = 0;
    });
  }
}

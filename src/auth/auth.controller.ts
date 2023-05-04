import {
  Body,
  Controller,
  Ip,
  Post,
  Headers,
  Res,
  HttpCode,
  UseGuards,
  UnauthorizedException,
  Get,
  Req,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenBanService } from '../security/tokens/token.ban.service';
import { UsersQuery } from '../users/users.query';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt.guard';
import { GetRefreshTokenPayload } from './decorators/get-decorators/get-refresh-token-payload.decorator';
import { TokenPayloadType } from './auth.types';
import { ThrottlerGuard } from '@nestjs/throttler';
import { InputLoginUserDto } from './dto/input.login.dto';
import { InputNewPasswordDto } from './dto/input.newpassword.dto';
import { InputRegistrationUserDto } from './dto/input.registration.user.dto';
import { InputEmailPasswordRecoveryDto } from './dto/input.email.passwordrecovery.dto';
import { InputConfirmationCodeDto } from './dto/input.confirmationcode.dto';
import { InputEmailDto } from './dto/input.email.dto';
import { OutputUserMeDto } from './dto/output.user.me.dto';
import { OutputAccessTokenDto } from './dto/output.token.dto';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from './use-cases/register.user.use-case';
import { ConfirmUserEmailCommand } from './use-cases/confirm.user.email.use-case';
import { ResendActivationCodeCommand } from './use-cases/resend.activation.code.use-case';
import { SendPasswordRecoveryCodeCommand } from './use-cases/send.password.recovery.code.use-case';
import { UpdatePasswordByRecoveryCodeCommand } from './use-cases/update.password.by.recovery.code.use-case';
import { ValidateUserCommand } from './use-cases/validate.user.use-case';
import { JwtAdapter } from './jwt.adapter';
import { StartNewSessionCommand } from '../security/devices/use-cases/start.new.session.use-case';
import { LogoutSessionCommand } from '../security/devices/use-cases/logout.session.use-case';
import { UpdateSessionWithDeviceIdCommand } from '../security/devices/use-cases/update.session.with.device.id.use-case';

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: true,
};

@Controller('auth')
export class AuthController {
  constructor(
    protected tokenBanService: TokenBanService,
    protected usersQueryRepo: UsersQuery,
    protected jwtAdapter: JwtAdapter,
    protected commandBus: CommandBus,
  ) {}
  //@UseGuards(ThrottlerGuard)
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() userLoginDto: InputLoginUserDto,
    @Ip() ip: string,
    @Headers('user-agent') deviceName: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<OutputAccessTokenDto> {
    const checkResult = await this.commandBus.execute(
      new ValidateUserCommand(userLoginDto),
    );
    if (!checkResult) throw new UnauthorizedException();
    const tokenPair = this.jwtAdapter.getTokenPair(checkResult);
    await this.commandBus.execute(
      new StartNewSessionCommand(
        tokenPair.refreshTokenMeta.refreshToken,
        tokenPair.refreshTokenMeta.userId,
        tokenPair.refreshTokenMeta.deviceId,
        deviceName,
        ip,
        tokenPair.refreshTokenMeta.issueDate,
        tokenPair.refreshTokenMeta.expDate,
      ),
    );
    response.cookie(
      'refreshToken',
      tokenPair.refreshTokenMeta.refreshToken,
      refreshTokenCookieOptions,
    );
    return { accessToken: tokenPair.accessToken };
  }
  @UseGuards(RefreshJwtGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(
    @GetRefreshTokenPayload() payload: TokenPayloadType,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.commandBus.execute(
      new LogoutSessionCommand(payload.deviceId, payload.userId),
    );
    await this.tokenBanService.banRefreshToken(
      request.cookies.refreshToken,
      payload.userId.toString(),
    );
    response.clearCookie('refreshToken');
    return;
  }
  @UseGuards(RefreshJwtGuard)
  @Post('refresh-token')
  @HttpCode(200)
  async updateRefreshToken(
    @GetRefreshTokenPayload() payload: TokenPayloadType,
    @Req() request: Request,
    @Res({ passthrough: true })
    response: Response,
  ): Promise<OutputAccessTokenDto> {
    const user = await this.usersQueryRepo.findUserById(
      payload.userId.toString(),
    );
    if (!user) throw new UnauthorizedException();
    await this.tokenBanService.banRefreshToken(
      request.cookies.refreshToken,
      user.id,
    );
    const tokenPair = this.jwtAdapter.getRefreshedTokenPair(
      user,
      payload.deviceId,
    );
    await this.commandBus.execute(
      new UpdateSessionWithDeviceIdCommand(
        tokenPair.refreshTokenMeta.refreshToken,
        payload.deviceId,
        tokenPair.refreshTokenMeta.issueDate,
        tokenPair.refreshTokenMeta.expDate,
      ),
    );
    response.cookie(
      'refreshToken',
      tokenPair.refreshTokenMeta.refreshToken,
      refreshTokenCookieOptions,
    );
    return { accessToken: tokenPair.accessToken };
  }
  //@UseGuards(ThrottlerGuard)
  @Post('registration')
  @HttpCode(204)
  async registerUser(@Body() registrationUserDto: InputRegistrationUserDto) {
    return await this.commandBus.execute(
      new RegisterUserCommand(registrationUserDto),
    );
  }
  //@UseGuards(ThrottlerGuard)
  @Post('registration-confirmation')
  @HttpCode(204)
  async confirmUserEmail(
    @Body() confirmationCodeDto: InputConfirmationCodeDto,
  ) {
    return await this.commandBus.execute(
      new ConfirmUserEmailCommand(confirmationCodeDto),
    );
  }
  //@UseGuards(ThrottlerGuard)
  @Post('registration-email-resending')
  @HttpCode(204)
  async resendActivationCode(@Body() emailDto: InputEmailDto) {
    return await this.commandBus.execute(
      new ResendActivationCodeCommand(emailDto),
    );
  }
  //@UseGuards(ThrottlerGuard)
  @Post('password-recovery')
  @HttpCode(204)
  async passwordRecovery(
    @Body() passwordRecoveryDto: InputEmailPasswordRecoveryDto,
  ) {
    return await this.commandBus.execute(
      new SendPasswordRecoveryCodeCommand(passwordRecoveryDto),
    );
  }
  @UseGuards(ThrottlerGuard)
  @Post('new-password')
  @HttpCode(204)
  async setNewPassword(@Body() newPasswordDto: InputNewPasswordDto) {
    return await this.commandBus.execute(
      new UpdatePasswordByRecoveryCodeCommand(newPasswordDto),
    );
  }
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('me')
  async me(@Req() req): Promise<OutputUserMeDto> {
    const user = await this.usersQueryRepo.findUserById(req.user.userId);
    if (!user) throw new UnauthorizedException();
    return {
      email: user.accountData.email,
      login: user.accountData.login,
      userId: user.id,
    };
  }
}

import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigurationType } from '../../configuration/configuration';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<ConfigurationType>,
  ) {
    super();
  }

  public validate = async (username, password): Promise<boolean> => {
    const adminLogin = this.configService.get('BASIC_AUTH_LOGIN');
    const adminPassword = this.configService.get('BASIC_AUTH_PASSWORD');
    if (adminLogin != username || adminPassword != password) {
      throw new UnauthorizedException();
    } else return true;
  };
}

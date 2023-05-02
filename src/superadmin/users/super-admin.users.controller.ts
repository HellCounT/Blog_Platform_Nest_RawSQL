import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { InputCreateUserDto } from './dto/input.create-user.dto';
import { CreateUserCommand } from './use-cases/create.user.use-case';
import { DeleteUserCommand } from './use-cases/delete.user.use-case';
import {
  parseUserQueryPagination,
  UserQueryParser,
} from '../../application-helpers/query.parser';
import { SuperAdminUsersQuery } from './super-admin.users.query';
import { InputBanUserDto } from './dto/input.ban-user.dto';
import { BanUserCommand } from './use-cases/ban.user.use-case';

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class SuperAdminUsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly superAdminUsersQueryRepo: SuperAdminUsersQuery,
  ) {}

  @Get()
  async getAllUsers(@Query() query: UserQueryParser) {
    const queryParams: UserQueryParser = parseUserQueryPagination(query);
    return this.superAdminUsersQueryRepo.viewAllUsers(queryParams);
  }

  @Post()
  @HttpCode(201)
  async createUser(@Body() userCreateDto: InputCreateUserDto) {
    return await this.commandBus.execute(new CreateUserCommand(userCreateDto));
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    return await this.commandBus.execute(new DeleteUserCommand(id));
  }

  @Put(':id/ban')
  @HttpCode(204)
  async banUser(@Param('id') id: string, @Body() banUserDto: InputBanUserDto) {
    await this.commandBus.execute(new BanUserCommand(banUserDto, id));
    return;
  }
}

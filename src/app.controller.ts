import { Controller, Delete, Get, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Delete('testing/all-data')
  @HttpCode(204)
  async deleteAllData() {
    await Promise.allSettled([
      this.dataSource.query(`DELETE FROM "USERS"`),
      this.dataSource.query(`DELETE FROM "POSTS"`),
      this.dataSource.query(`DELETE FROM "BLOGS"`),
      this.dataSource.query(`DELETE FROM "COMMENTS"`),
      this.dataSource.query(`DELETE FROM "LIKES_FOR_COMMENTS"`),
      this.dataSource.query(`DELETE FROM "LIKES_FOR_POSTS"`),
      this.dataSource.query(`DELETE FROM "BANNED_USERS_BY_BLOGGERS"`),
    ]);
    return;
  }
}

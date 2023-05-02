import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { useContainer } from 'class-validator';
import { HttpExceptionFilter } from '../src/http-exception.filter';
import cookieParser from 'cookie-parser';

export async function setConfigNestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const nestApp = moduleFixture.createNestApplication();
  useContainer(nestApp.select(AppModule), { fallbackOnErrors: true });
  nestApp.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsForResponse = [];
        errors.forEach((e) => {
          const constraintsKeys = Object.keys(e.constraints);
          constraintsKeys.forEach((cKey) => {
            errorsForResponse.push({
              message: e.constraints[cKey],
              field: e.property,
            });
          });
        });

        throw new BadRequestException(errorsForResponse);
      },
    }),
  );
  nestApp.useGlobalFilters(new HttpExceptionFilter());
  nestApp.use(cookieParser());
  return nestApp;
}

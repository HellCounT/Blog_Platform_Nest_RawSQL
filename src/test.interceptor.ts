import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class TestInterceptor implements NestInterceptor {
  private counter = 0;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    this.counter++;
    console.log({
      type: 'req',
      url: req.url,
      body: req.body,
      date: new Date().toISOString(),
      connectionCount: this.counter,
    });

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        console.log({
          type: 'res',
          answerCode: res.statusCode,
        });
      }),
    );
  }
}

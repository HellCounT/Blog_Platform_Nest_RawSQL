import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    if (!request.user.userId)
      throw new Error('No user id in request or payload');
    return request.user.userId as string;
  },
);

import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { ExecutionContext } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';
import * as db from '@career-covered/db';

// NestJS custom param decorators (createParamDecorator) can't be invoked
// directly — this is Nest's own recipe for extracting the underlying
// factory function from the route-args metadata so it can be unit tested.
function getParamDecoratorFactory(decorator: ParameterDecorator) {
  class TestDecorator {
    public test(@decorator() _value: unknown) {}
  }

  const args = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    TestDecorator,
    'test',
  ) as Record<
    string,
    { factory: (data: unknown, ctx: ExecutionContext) => unknown }
  >;
  return args[Object.keys(args)[0]].factory;
}

describe('CurrentUser decorator', () => {
  it('extracts the user attached to the request by AuthGuard', () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' } as db.User;
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser }),
      }),
    } as unknown as ExecutionContext;

    const factory = getParamDecoratorFactory(CurrentUser);
    const result = factory(undefined, mockContext);

    expect(result).toEqual(mockUser);
  });

  it('returns undefined when no user has been attached to the request', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    const factory = getParamDecoratorFactory(CurrentUser);
    const result = factory(undefined, mockContext);

    expect(result).toBeUndefined();
  });
});

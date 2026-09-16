import type express from 'express';
import { swaggerBasicAuth } from './main';

function mockReqRes(authorization?: string) {
  const req = { headers: { authorization } } as express.Request;
  const res = {
    set: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as express.Response;
  const next = jest.fn();
  return { req, res, next };
}

describe('swaggerBasicAuth', () => {
  const originalUser = process.env.SWAGGER_USER;
  const originalPassword = process.env.SWAGGER_PASSWORD;

  afterEach(() => {
    process.env.SWAGGER_USER = originalUser;
    process.env.SWAGGER_PASSWORD = originalPassword;
  });

  it('lets every request through when SWAGGER_USER/PASSWORD are not configured', () => {
    delete process.env.SWAGGER_USER;
    delete process.env.SWAGGER_PASSWORD;
    const { req, res, next } = mockReqRes();

    swaggerBasicAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects with 401 when no Authorization header is present', () => {
    process.env.SWAGGER_USER = 'admin';
    process.env.SWAGGER_PASSWORD = 'secret';
    const { req, res, next } = mockReqRes();

    swaggerBasicAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.set).toHaveBeenCalledWith(
      'WWW-Authenticate',
      'Basic realm="Swagger"',
    );
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects with 401 when the credentials are wrong', () => {
    process.env.SWAGGER_USER = 'admin';
    process.env.SWAGGER_PASSWORD = 'secret';
    const bad = Buffer.from('admin:wrong-password').toString('base64');
    const { req, res, next } = mockReqRes(`Basic ${bad}`);

    swaggerBasicAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects with 401 when the Authorization scheme is not Basic', () => {
    process.env.SWAGGER_USER = 'admin';
    process.env.SWAGGER_PASSWORD = 'secret';
    const { req, res, next } = mockReqRes('Bearer some-token');

    swaggerBasicAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('calls next() when the credentials are correct', () => {
    process.env.SWAGGER_USER = 'admin';
    process.env.SWAGGER_PASSWORD = 'secret';
    const good = Buffer.from('admin:secret').toString('base64');
    const { req, res, next } = mockReqRes(`Basic ${good}`);

    swaggerBasicAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('supports a password containing a colon', () => {
    process.env.SWAGGER_USER = 'admin';
    process.env.SWAGGER_PASSWORD = 'sec:ret';
    const good = Buffer.from('admin:sec:ret').toString('base64');
    const { req, res, next } = mockReqRes(`Basic ${good}`);

    swaggerBasicAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});

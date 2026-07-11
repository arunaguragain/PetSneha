const request = require('supertest');
const express = require('express');

jest.mock('../src/services/auth.service', () => ({
  register: jest.fn(),
  login: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  googleLogin: jest.fn(),
}));

const authService = require('../src/services/auth.service');
const authController = require('../src/controllers/auth.controller');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.post('/register', authController.register);
  app.post('/login', authController.login);
  app.post('/forgot-password', authController.forgotPassword);
  app.post('/reset-password/:token', authController.resetPassword);
  app.post('/google', authController.googleLogin);
  return app;
}

describe('auth controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a created response for register', async () => {
    authService.register.mockResolvedValue({ user: { id: 'u1' }, token: 'abc' });

    const res = await request(buildApp())
      .post('/register')
      .send({ name: 'Jane', email: 'jane@example.com', password: 'Password123!' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      status: 'success',
      data: { user: { id: 'u1' }, token: 'abc' },
    });
  });

  it('returns a success response for login', async () => {
    authService.login.mockResolvedValue({ user: { id: 'u1' }, token: 'abc' });

    const res = await request(buildApp())
      .post('/login')
      .send({ email: 'jane@example.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('returns a success response for forgot password', async () => {
    authService.forgotPassword.mockResolvedValue({ message: 'Reset email sent' });

    const res = await request(buildApp())
      .post('/forgot-password')
      .send({ email: 'jane@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ message: 'Reset email sent' });
  });
});

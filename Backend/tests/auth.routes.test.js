const request = require('supertest');
const express = require('express');

jest.mock('../src/controllers/auth.controller', () => ({
  register: jest.fn((req, res) => res.status(201).json({ ok: true })),
  login: jest.fn((req, res) => res.status(200).json({ ok: true })),
  googleLogin: jest.fn((req, res) => res.status(200).json({ ok: true })),
  logout: jest.fn((req, res) => res.status(200).json({ ok: true })),
  forgotPassword: jest.fn((req, res) => res.status(200).json({ ok: true })),
  resetPassword: jest.fn((req, res) => res.status(200).json({ ok: true })),
}));

jest.mock('../src/middleware/validate.middleware', () => ({
  validateRequest: jest.fn((req, res, next) => next()),
}));

jest.mock('../src/utils/passwordValidator', () => ({
  validatePassword: jest.fn(() => ({ isValid: true, errors: [] })),
}));

const authRoutes = require('../src/routes/auth.routes');

describe('auth routes', () => {
  it('registers auth endpoints', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    const res = await request(app).post('/api/auth/register').send({ name: 'Jane', email: 'jane@example.com', password: 'Password123!' });

    expect(res.status).toBe(201);
  });

  it('handles login route', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    const res = await request(app).post('/api/auth/login').send({ email: 'jane@example.com', password: 'Password123!' });

    expect(res.status).toBe(200);
  });
});

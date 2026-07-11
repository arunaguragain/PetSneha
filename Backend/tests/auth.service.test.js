jest.mock('../src/repositories/user.repository', () => ({
  findByEmail: jest.fn(),
  create: jest.fn(),
  updateById: jest.fn(),
}));

jest.mock('../src/services/notification.service', () => ({
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock('../src/utils/generateToken', () => jest.fn(() => 'generated-token'));

const userRepository = require('../src/repositories/user.repository');
const notificationService = require('../src/services/notification.service');
const authService = require('../src/services/auth.service');

describe('auth service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('rejects duplicate email registration', async () => {
    userRepository.findByEmail.mockResolvedValue({ email: 'existing@example.com' });

    await expect(authService.register({ email: 'existing@example.com', password: 'Password123!' })).rejects.toMatchObject({
      statusCode: 409,
      message: 'Email already exists.',
    });
  });

  it('returns a token and public user on successful login', async () => {
    userRepository.findByEmail.mockResolvedValue({ email: 'jane@example.com', password: 'hashed', toObject: () => ({ email: 'jane@example.com' }) });

    const bcrypt = require('bcryptjs');
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const result = await authService.login({ email: 'jane@example.com', password: 'Password123!' });

    expect(result.token).toBe('generated-token');
    expect(result.user.email).toBe('jane@example.com');
  });

  it('sends a reset email when the account exists', async () => {
    userRepository.findByEmail.mockResolvedValue({ _id: 'user-1', email: 'jane@example.com' });
    notificationService.sendPasswordResetEmail.mockResolvedValue(undefined);

    const result = await authService.forgotPassword({ email: 'jane@example.com' });

    expect(notificationService.sendPasswordResetEmail).toHaveBeenCalled();
    expect(result.message).toContain('reset link');
  });
});

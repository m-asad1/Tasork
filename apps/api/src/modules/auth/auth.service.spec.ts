import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { MailService } from '@/modules/mail/mail.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { UsersService } from '@/modules/users/users.service';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = { findByEmail: jest.fn(), create: jest.fn(), toPublic: jest.fn((u) => u) };
  const mockPrisma = {
    emailVerificationToken: { create: jest.fn() },
    refreshToken: { create: jest.fn() },
  };
  const mockJwt = { sign: jest.fn(() => 'signed.jwt.token') };
  const mockConfig = { get: jest.fn((key: string) => (key === 'appUrl' ? 'http://localhost:3000' : 'secret')) };
  const mockMail = { sendVerificationEmail: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: MailService, useValue: mockMail },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registers a new user and sends a verification email', async () => {
    mockUsersService.findByEmail.mockResolvedValueOnce(null);
    mockUsersService.create.mockResolvedValueOnce({ id: '1', email: 'jane@example.com', fullName: 'Jane' });

    await service.register({ fullName: 'Jane', email: 'jane@example.com', password: 'StrongPass1' });

    expect(mockUsersService.create).toHaveBeenCalled();
    expect(mockMail.sendVerificationEmail).toHaveBeenCalledWith('jane@example.com', expect.stringContaining('/verify-email?token='));
  });
});

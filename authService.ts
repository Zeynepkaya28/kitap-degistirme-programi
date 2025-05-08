import { PrismaClient } from '@prisma/client';
import { SecurityUtils } from '../utils/security';
import { EmailService } from './emailService';
import { securityConfig } from '../config/security';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';

const prisma = new PrismaClient();
const emailService = new EmailService();

export class AuthService {
  // Kullanıcı kaydı
  async register(email: string, password: string, username: string) {
    const passwordValidation = SecurityUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    const hashedPassword = await SecurityUtils.hashPassword(password);
    const verificationToken = SecurityUtils.generateSecureToken();

    const user = await prisma.user.create({
      data: {
        email: SecurityUtils.sanitizeInput(email),
        password: hashedPassword,
        username: SecurityUtils.sanitizeInput(username),
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + securityConfig.emailVerification.tokenExpiresIn),
      },
    });

    await emailService.sendVerificationEmail(email, verificationToken);
    return user;
  }

  // Kullanıcı girişi
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: SecurityUtils.sanitizeInput(email) },
    });

    if (!user) {
      throw new Error('E-posta veya şifre yanlış');
    }

    if (!user.isEmailVerified) {
      throw new Error('Lütfen e-posta adresinizi doğrulayın');
    }

    if (user.isAccountLocked) {
      const lockoutDuration = securityConfig.session.lockoutDuration;
      const timeLeft = user.accountLockUntil!.getTime() - Date.now();
      
      if (timeLeft > 0) {
        throw new Error(`Hesabınız kilitlendi. Lütfen ${Math.ceil(timeLeft / 1000)} saniye bekleyin.`);
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isAccountLocked: false,
            failedLoginAttempts: 0,
          },
        });
      }
    }

    const isValidPassword = await SecurityUtils.verifyPassword(user.password, password);
    if (!isValidPassword) {
      await this.handleFailedLogin(user.id);
      throw new Error('E-posta veya şifre yanlış');
    }

    if (user.isTwoFactorEnabled) {
      const twoFactorCode = authenticator.generate(user.twoFactorSecret!);
      await emailService.sendTwoFactorCode(user.email, twoFactorCode);
      return { requiresTwoFactor: true, userId: user.id };
    }

    return this.generateTokens(user);
  }

  // İki faktörlü doğrulama
  async verifyTwoFactor(userId: string, code: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new Error('Geçersiz kullanıcı');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new Error('Geçersiz doğrulama kodu');
    }

    return this.generateTokens(user);
  }

  // Token yenileme
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, securityConfig.jwt.secret) as { userId: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      
      if (!user) {
        throw new Error('Geçersiz token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Geçersiz token');
    }
  }

  // Şifre sıfırlama talebi
  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: SecurityUtils.sanitizeInput(email) },
    });

    if (user) {
      const resetToken = SecurityUtils.generateSecureToken();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: new Date(Date.now() + securityConfig.passwordReset.tokenExpiresIn),
        },
      });

      await emailService.sendPasswordResetEmail(email, resetToken);
    }

    // Güvenlik için her zaman başarılı mesajı döndür
    return { message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi' };
  }

  // Hesap silme talebi
  async requestAccountDeletion(userId: string, reason: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        accountDeletionRequested: true,
        accountDeletionReason: reason,
        accountDeletionRequestDate: new Date(),
        accountDeletionDate: new Date(Date.now() + securityConfig.accountDeletion.gracePeriod),
      },
    });

    await emailService.sendAccountDeletionConfirmationEmail(user.email, reason);
    return { message: 'Hesap silme talebi alındı' };
  }

  // Hesap silme işlemini iptal et
  async cancelAccountDeletion(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        accountDeletionRequested: false,
        accountDeletionReason: null,
        accountDeletionRequestDate: null,
        accountDeletionDate: null,
      },
    });
  }

  private async handleFailedLogin(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const newAttempts = user.failedLoginAttempts + 1;
    const isLocked = newAttempts >= securityConfig.session.maxLoginAttempts;

    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: newAttempts,
        lastLoginAttempt: new Date(),
        isAccountLocked: isLocked,
        accountLockUntil: isLocked ? new Date(Date.now() + securityConfig.session.lockoutDuration) : null,
      },
    });
  }

  private generateTokens(user: any) {
    const accessToken = jwt.sign(
      { userId: user.id },
      securityConfig.jwt.secret,
      { expiresIn: securityConfig.jwt.expiresIn }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      securityConfig.jwt.secret,
      { expiresIn: securityConfig.jwt.refreshTokenExpiresIn }
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }
} 
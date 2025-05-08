import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'E-posta Adresinizi Doğrulayın',
      html: `
        <h1>E-posta Doğrulama</h1>
        <p>Merhaba,</p>
        <p>Hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
        <a href="${verificationUrl}">E-posta Adresimi Doğrula</a>
        <p>Bu bağlantı 24 saat geçerlidir.</p>
        <p>Eğer bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Şifre Sıfırlama',
      html: `
        <h1>Şifre Sıfırlama</h1>
        <p>Merhaba,</p>
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        <a href="${resetUrl}">Şifremi Sıfırla</a>
        <p>Bu bağlantı 7 dakika geçerlidir.</p>
        <p>Eğer bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.</p>
      `,
    });
  }

  async sendAccountDeletionConfirmationEmail(email: string, reason: string): Promise<void> {
    const confirmationUrl = `${process.env.FRONTEND_URL}/confirm-account-deletion?reason=${encodeURIComponent(reason)}`;
    
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Hesap Silme Onayı',
      html: `
        <h1>Hesap Silme Talebi</h1>
        <p>Merhaba,</p>
        <p>Hesabınızı silmek için bir talep alındı.</p>
        <p>Silme nedeni: ${reason}</p>
        <p>Hesabınızı silmek için aşağıdaki bağlantıya tıklayın:</p>
        <a href="${confirmationUrl}">Hesabımı Sil</a>
        <p>Bu işlemi onayladıktan sonra hesabınız 15 gün içinde silinecektir.</p>
        <p>Bu süre içinde giriş yaparsanız, silme talebi otomatik olarak iptal edilecektir.</p>
        <p>Eğer bu talebi siz yapmadıysanız, lütfen dikkate almayın.</p>
      `,
    });
  }

  async sendTwoFactorCode(email: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'İki Faktörlü Doğrulama Kodu',
      html: `
        <h1>İki Faktörlü Doğrulama</h1>
        <p>Merhaba,</p>
        <p>İki faktörlü doğrulama kodunuz: <strong>${code}</strong></p>
        <p>Bu kod 5 dakika geçerlidir.</p>
        <p>Eğer bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.</p>
      `,
    });
  }
} 
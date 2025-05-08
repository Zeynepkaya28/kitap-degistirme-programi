import * as argon2 from 'argon2';
import { securityConfig } from '../config/security';
import { randomBytes } from 'crypto';

export class SecurityUtils {
  // Şifre doğrulama
  static validatePassword(password: string): { isValid: boolean; message: string } {
    if (password.length < securityConfig.password.minLength) {
      return {
        isValid: false,
        message: `Şifre en az ${securityConfig.password.minLength} karakter uzunluğunda olmalıdır.`
      };
    }

    if (securityConfig.password.requireUppercase && !/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: 'Şifre en az bir büyük harf içermelidir.'
      };
    }

    if (securityConfig.password.requireNumber && !/[0-9]/.test(password)) {
      return {
        isValid: false,
        message: 'Şifre en az bir rakam içermelidir.'
      };
    }

    if (securityConfig.password.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return {
        isValid: false,
        message: 'Şifre en az bir özel karakter içermelidir.'
      };
    }

    return { isValid: true, message: '' };
  }

  // Şifre hashleme
  static async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 4
    });
  }

  // Şifre doğrulama
  static async verifyPassword(hash: string, password: string): Promise<boolean> {
    return await argon2.verify(hash, password);
  }

  // Güvenli token oluşturma
  static generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  // XSS koruması
  static sanitizeInput(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // SQL Injection koruması
  static escapeSqlString(str: string): string {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
      switch (char) {
        case "\0":
          return "\\0";
        case "\x08":
          return "\\b";
        case "\x09":
          return "\\t";
        case "\x1a":
          return "\\z";
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "\"":
        case "'":
        case "\\":
        case "%":
          return "\\" + char;
        default:
          return char;
      }
    });
  }
} 
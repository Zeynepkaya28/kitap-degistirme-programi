import express from 'express';
import { AuthService } from '../services/authService';
import { SecurityUtils } from '../utils/security';
import { securityConfig } from '../config/security';
import { Recaptcha2 } from 'recaptcha2';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const router = express.Router();
const authService = new AuthService();
const recaptcha = new Recaptcha2({
  siteKey: securityConfig.recaptcha.siteKey,
  secretKey: securityConfig.recaptcha.secretKey,
});

// Google OAuth yapılandırması
passport.use(new GoogleStrategy({
  clientID: securityConfig.google.clientID,
  clientSecret: securityConfig.google.clientSecret,
  callbackURL: securityConfig.google.callbackURL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await authService.findOrCreateGoogleUser(profile);
    return done(null, user);
  } catch (error) {
    return done(error as Error);
  }
}));

// Kayıt olma
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // reCAPTCHA doğrulama
    const recaptchaResult = await recaptcha.validate(req.body.recaptcha);
    if (!recaptchaResult) {
      return res.status(400).json({ error: 'reCAPTCHA doğrulaması başarısız' });
    }

    const user = await authService.register(email, password, username);
    res.status(201).json({ message: 'Kayıt başarılı. Lütfen e-posta adresinizi doğrulayın.' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Giriş yapma
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // reCAPTCHA doğrulama
    const recaptchaResult = await recaptcha.validate(req.body.recaptcha);
    if (!recaptchaResult) {
      return res.status(400).json({ error: 'reCAPTCHA doğrulaması başarısız' });
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
});

// İki faktörlü doğrulama
router.post('/verify-2fa', async (req, res) => {
  try {
    const { userId, code } = req.body;
    const result = await authService.verifyTwoFactor(userId, code);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
});

// Token yenileme
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
});

// Şifre sıfırlama talebi
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Google ile giriş
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

// Hesap silme talebi
router.post('/request-account-deletion', async (req, res) => {
  try {
    const { userId, reason } = req.body;
    const result = await authService.requestAccountDeletion(userId, reason);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Hesap silme işlemini iptal et
router.post('/cancel-account-deletion', async (req, res) => {
  try {
    const { userId } = req.body;
    await authService.cancelAccountDeletion(userId);
    res.json({ message: 'Hesap silme işlemi iptal edildi' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router; 
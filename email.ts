import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'E-posta Adresinizi Doğrulayın',
    html: `
      <h1>E-posta Doğrulama</h1>
      <p>Hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
      <a href="${verificationUrl}">E-posta Adresimi Doğrula</a>
      <p>Bu bağlantı 24 saat geçerlidir.</p>
      <p>Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Şifre Sıfırlama',
    html: `
      <h1>Şifre Sıfırlama</h1>
      <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
      <a href="${resetUrl}">Şifremi Sıfırla</a>
      <p>Bu bağlantı 7 dakika geçerlidir.</p>
      <p>Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}; 
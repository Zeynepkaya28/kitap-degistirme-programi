import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Geçersiz veri formatı' });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Yetkisiz erişim' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Oturum süresi doldu' });
  }

  res.status(500).json({ message: 'Sunucu hatası' });
}; 
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error no controlado:', err);
  res.status(500).json({
    message: 'Ocurrió un error interno en el servidor.',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
}

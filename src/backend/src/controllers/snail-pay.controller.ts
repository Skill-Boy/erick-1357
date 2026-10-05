import { NextFunction, Request, Response } from 'express';
import { ChargeRequest } from '../types/payment.types';
import { snailPayService } from '../services/snail-pay.service';

export class SnailPayController {
  public charge(req: Request, res: Response, next: NextFunction): void {
    try {
      const payment = snailPayService.charge(req.body as ChargeRequest);
      const statusCode = payment.status === 'approved' ? 201 : payment.status === 'rejected' ? 422 : 503;
      res.status(statusCode).json(payment);
    } catch (error) {
      next(error);
    }
  }
}

export const snailPayController = new SnailPayController();
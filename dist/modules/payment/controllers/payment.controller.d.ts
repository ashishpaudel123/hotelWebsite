import { Request, Response, NextFunction } from 'express';
export declare const createPayment: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const getPaymentByBookingId: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=payment.controller.d.ts.map
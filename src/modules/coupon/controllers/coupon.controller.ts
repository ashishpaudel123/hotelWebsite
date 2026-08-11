import { Request, Response, NextFunction } from 'express';
import { responseHandler } from '../../../utils/responseHandler';
import { Coupon } from '../../../models';

export const getCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status) filter.status = status;

    const coupons = await Coupon.find(filter).sort({ createdAt: -1 }).lean();
    return responseHandler.success(res, coupons, 'Coupons retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await Coupon.create(req.body);
    return responseHandler.created(res, coupon, 'Coupon created successfully');
  } catch (error) {
    return next(error);
  }
};

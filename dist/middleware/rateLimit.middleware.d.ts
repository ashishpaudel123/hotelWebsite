export declare const apiLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const paymentLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const createRateLimiter: (windowMs: number, max: number, messageCode: string, message: string) => import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimit.middleware.d.ts.map
import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { responseHandler } from "../utils/responseHandler";

export const validateRequest = async (req: Request, schema: ZodSchema) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      throw {
        status: 400,
        code: "VAL_001",
        message: "Validation failed",
        details,
      };
    }
    throw error;
  }
};

export const validationMiddleware = (schema: ZodSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await validateRequest(req, schema);
      return next();
    } catch (error: any) {
      if (error.status === 400 && error.details) {
        responseHandler.validation(res, error.details);
        return;
      }
      return next(error);
    }
  };
};

// Validation helper for query parameters with pagination
export const paginateSchema = {
  page: (defaultPage: number = 1) =>
    require("zod").z.coerce.number().int().min(1).default(defaultPage),
  limit: (defaultLimit: number = 20) =>
    require("zod")
      .z.coerce.number()
      .int()
      .min(1)
      .max(100)
      .default(defaultLimit),
  sortBy: (defaultSort: string = "createdAt") =>
    require("zod").z.string().default(defaultSort),
  sortOrder: () => require("zod").z.enum(["asc", "desc"]).default("desc"),
  search: () => require("zod").z.string().optional(),
  status: () =>
    require("zod").z.enum(["active", "inactive", "deleted"]).optional(),
};

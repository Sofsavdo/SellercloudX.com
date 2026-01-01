declare module "multer";
declare module "swagger-ui-express";
declare module "swagger-jsdoc";
declare module "better-sqlite3";
declare module "cookie-parser";
declare module "bcryptjs";
declare module "memoizee";
declare module "morgan";
declare module "connect-pg-simple";
declare module "memorystore";
declare module "speakeasy";
declare module "csurf";
declare module "compression";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        role: "admin" | "customer" | "partner";
        partnerId?: string;
        pricingTier?: string;
        aiEnabled?: boolean;
      };
      file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      };
      files?: Array<{
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }>;
      csrfToken?: () => string;
    }
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}

export {};

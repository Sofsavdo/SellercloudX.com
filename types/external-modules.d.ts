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

import { User } from '../shared/schema';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

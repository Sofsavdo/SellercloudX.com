import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      email: string;
      role: 'admin' | 'partner' | 'customer';
      partnerId?: number;
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        role: 'admin' | 'partner' | 'customer';
        partnerId?: number;
      };
    }
  }
}

export {};


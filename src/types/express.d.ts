import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        restaurantId?: string;
        is_super_admin?: boolean;
      };
    }
  }
}

export {}; 
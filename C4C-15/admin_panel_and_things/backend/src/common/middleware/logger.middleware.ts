import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const executionTime = Date.now() - startTime;

      const user = (req as any).user;
      const role = user?.role || 'GUEST';

      this.logger.log(
        `[${method}] ${originalUrl} - Role: ${role} - Status: ${statusCode} - ${executionTime}ms`,
      );
    });

    next();
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { Public } from '@/modules/auth/decorators/public.decorator';

/** Used by uptime monitors and the deployment platform's health check — see docs/31_DevOps.md. */
@ApiExcludeController()
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

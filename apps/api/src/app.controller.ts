import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Public so hosting platforms (e.g. Render) can health-check the root
  // path without needing an authenticated session.
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  /** Hub / Docker compose healthcheck target (`curl -f http://127.0.0.1:3001/health`). */
  @Get('health')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  health(): string {
    return 'ok\n';
  }
}

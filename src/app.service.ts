import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      time: new Date().toISOString(),
      message: "Enova Auth Module"
    };
  }
}

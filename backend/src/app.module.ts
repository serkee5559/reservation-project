import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGatewayGateway } from './app_gateway/app_gateway.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, AppGatewayGateway],
})
export class AppModule {}

import { Test, TestingModule } from '@nestjs/testing';
import { AppGatewayGateway } from './app_gateway.gateway';

describe('AppGatewayGateway', () => {
  let gateway: AppGatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppGatewayGateway],
    }).compile();

    gateway = module.get<AppGatewayGateway>(AppGatewayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

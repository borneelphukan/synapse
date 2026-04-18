import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body() body: { plan: 'BASIC' | 'PRO' },
    @Req() req: any,
  ) {
    return this.billingService.createCheckoutSession(req.user.id, body.plan);
  }

  @Post('confirm-payment')
  @UseGuards(JwtAuthGuard)
  async confirmPayment(
    @Body() body: { sessionId: string },
    @Req() req: any,
  ) {
    return this.billingService.confirmPayment(body.sessionId, req.user.id);
  }
}

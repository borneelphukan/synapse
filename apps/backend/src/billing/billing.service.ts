import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  private stripe: InstanceType<typeof Stripe>;
  private readonly logger = new Logger(BillingService.name);

  constructor(private config: ConfigService, private prisma: PrismaService) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY') || 'sk_test_123');
  }

  async createCheckoutSession(userId: string, plan: 'BASIC' | 'PRO') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const amount = plan === 'BASIC' ? 1000 : 5000;
    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Synapse AI - ${plan} Plan`,
                description: plan === 'BASIC' ? '10 transcript analysis / day' : 'Unlimited analysis / day',
              },
              unit_amount: amount,
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${frontendUrl}/?success=true&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/pricing?canceled=true`,
        metadata: {
          userId: user.id,
          plan: plan,
        },
      });

      return { url: session.url };
    } catch (err: any) {
      this.logger.error(`Error creating Stripe session: ${err?.message || 'Unknown error'}`, err?.stack);
      
      const stripeKey = this.config.get('STRIPE_SECRET_KEY');
      const isPlaceholder = !stripeKey || stripeKey.includes('...');
      
      if (isPlaceholder) {
        this.logger.warn('Stripe key is missing or a placeholder. Simulating successful checkout for dev.');
        
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            isPaid: true,
            plan: plan as any,
          },
        });
        
        return { url: `${frontendUrl}/?success=true&simulated=true` };
      }
      
      throw new BadRequestException(`Stripe Error: ${err?.message || 'Payment creation failed'}`);
    }
  }

  async confirmPayment(sessionId: string, userId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid' || session.status === 'complete') {
        const plan = session.metadata?.plan;
        
        if (plan) {
          await this.prisma.user.update({
            where: { id: userId },
            data: {
              isPaid: true,
              plan: plan as any,
              analysisCount: 0, // Reset count for the day upon upgrade
            },
          });
          
          return { success: true, plan };
        }
      }
      return { success: false };
    } catch (err) {
      this.logger.error('Error confirming payment:', err);
      return { success: false };
    }
  }
}

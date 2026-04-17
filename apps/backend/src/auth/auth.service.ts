import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('An account with this email already exists.');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash,
        company: dto.company || null,
      },
    });

    return this.signToken(user.id, user.email);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, company: true, isPaid: true },
    });
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials.');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials.');

    return this.signToken(user.id, user.email);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
      // Always return success-looking response to not expose user existence
      if (!user) {
        console.log(`Password reset requested for non-existent email: ${dto.email}`);
        return { message: 'If an account exists, a reset link has been sent.' };
      }

      const rawToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

      await this.prisma.passwordResetToken.create({
        data: { token: rawToken, userId: user.id, expiresAt },
      });

      const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
      const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

      // LOG LINK TO CONSOLE FOR DEVELOPMENT
      console.log('\n=======================================');
      console.log('🔑 PASSWORD RESET REQUEST');
      console.log(`📧 User: ${user.email}`);
      console.log(`🔗 Link: ${resetLink}`);
      console.log('=======================================\n');

      try {
        await this.sendResetEmail(user.email, user.firstName, resetLink);
      } catch (emailError) {
        console.warn('⚠️ SMTP Email delivery failed, but reset token was created:', emailError.message);
        // We don't throw here so the user sees a success message and can check the console for the link
      }

      return { message: 'If an account exists, a reset link has been sent.' };
    } catch (error) {
      console.error('Forgot Password Error:', error);
      throw error; // Let Nest handle the 500 but log it first
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!record || record.used || record.expiresAt < new Date()) {
      throw new BadRequestException('This reset link is invalid or has expired.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    return { message: 'Password reset successfully.' };
  }

  private async signToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    const token = await this.jwt.signAsync(payload);
    return { access_token: token };
  }

  private async sendResetEmail(to: string, firstName: string, resetLink: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #020617; color: #e2e8f0; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 40px auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #0ea5e9, #6366f1); padding: 32px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .body { padding: 32px; }
          .body p { color: #94a3b8; line-height: 1.6; margin: 0 0 16px; }
          .body strong { color: #e2e8f0; }
          .btn { display: block; width: fit-content; margin: 24px auto; background: #0ea5e9; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; }
          .footer { padding: 24px 32px; border-top: 1px solid #1e293b; }
          .footer p { color: #475569; font-size: 12px; margin: 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Synapse AI</h1></div>
          <div class="body">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>We received a request to reset your Synapse password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
            <a href="${resetLink}" class="btn">Reset Password</a>
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer"><p>© ${new Date().getFullYear()} Synapse AI. This is an automated email, please do not reply.</p></div>
        </div>
      </body>
      </html>
    `;

    const host = this.config.get('SMTP_HOST');
    const port = Number(this.config.get('SMTP_PORT')) || 587;
    const user = this.config.get('SMTP_USER');
    const pass = this.config.get('SMTP_PASS');
    const from = this.config.get('SMTP_FROM');

    if (!host || !user || !pass || !from) {
      console.error('SMTP Configuration is missing. Cannot send reset email.');
      throw new Error('Email configuration error');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    try {
      await transporter.sendMail({
        from,
        to,
        subject: 'Reset your Synapse password',
        html,
      });
      console.log(`Reset email sent to ${to}`);
    } catch (error) {
      console.error('Nodemailer Error:', error);
      throw error;
    }
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';

export type Session = {
  token: string;
  username: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private encryption: EncryptionService,
  ) {}

  private get adminUsername() {
    return process.env.ADMIN_USERNAME ?? '';
  }

  private get adminPassword() {
    return process.env.ADMIN_PASSWORD ?? '';
  }

  private get ttlMs() {
    const raw = process.env.SESSION_TTL_SECONDS;
    const seconds = raw ? Number(raw) : 60 * 60 * 12;
    const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 60 * 60 * 12;
    return safeSeconds * 1000;
  }

  async onModuleInit() {
    await this.ensureAdminUser();
  }

  private async ensureAdminUser() {
    const envOk = this.validateEnvConfigured();
    if (!envOk.ok) {
      throw new Error(envOk.reason);
    }

    let user = await this.prisma.user.findUnique({
      where: { username: this.adminUsername },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(this.adminPassword, 10);
      user = await this.prisma.user.create({
        data: {
          username: this.adminUsername,
          password: hashedPassword,
        },
      });
    }
  }

  validateEnvConfigured(): { ok: boolean; reason?: string } {
    if (!this.adminUsername || !this.adminPassword) {
      return { ok: false, reason: 'Missing ADMIN_USERNAME or ADMIN_PASSWORD' };
    }
    return { ok: true };
  }

  async login(username: string, password: string): Promise<{ token: string; expiresAt: number }> {
    const envOk = this.validateEnvConfigured();
    if (!envOk.ok) {
      throw new Error(envOk.reason);
    }

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const now = Date.now();
    const expiresAt = now + this.ttlMs;

    const jwtToken = this.jwtService.sign({
      sub: user.id,
      username: user.username,
    });

    await this.prisma.session.create({
      data: {
        token: jwtToken,
        userId: user.id,
        expiresAt: new Date(expiresAt),
      },
    });

    return { token: jwtToken, expiresAt };
  }

  async logout(token: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { token },
    });
  }

  async getSession(token: string): Promise<Session | null> {
    try {
      const payload = this.jwtService.verify(token);
      
      const session = await this.prisma.session.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!session) {
        return null;
      }

      if (new Date() > session.expiresAt) {
        await this.prisma.session.delete({
          where: { id: session.id },
        });
        return null;
      }

      return {
        token: session.token,
        username: session.user.username,
        userId: session.user.id,
        createdAt: session.createdAt.getTime(),
        expiresAt: session.expiresAt.getTime(),
      };
    } catch {
      return null;
    }
  }
}
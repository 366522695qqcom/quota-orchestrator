import { Controller, Get, Put, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { SmtpConfigService } from './smtp-config.service';
import { UpdateSmtpConfigDto } from './smtp-config.dto';

@Controller('smtp-config')
@UseGuards()
export class SmtpConfigController {
  constructor(private readonly smtpConfigService: SmtpConfigService) {}

  @Get()
  async getConfig(@Request() req: any) {
    const config = await this.smtpConfigService.getConfig(req.user.userId);
    return { ok: true, config };
  }

  @Put()
  async updateConfig(@Request() req: any, @Body() body: UpdateSmtpConfigDto) {
    const config = await this.smtpConfigService.updateConfig(req.user.userId, body);
    return { ok: true, config };
  }

  @Delete()
  async deleteConfig(@Request() req: any) {
    await this.smtpConfigService.deleteConfig(req.user.userId);
    return { ok: true };
  }
}
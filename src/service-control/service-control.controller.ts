import { Controller, Post, Body, Param, Get, Delete, UseGuards, Request } from '@nestjs/common';
import { ServiceControlService } from './service-control.service';

@Controller('service-control')
@UseGuards()
export class ServiceControlController {
  constructor(private readonly serviceControlService: ServiceControlService) {}

  @Post('execute')
  execute(@Request() req, @Body() body: {
    configId: string;
    action: 'STOP' | 'START' | 'RESTART';
    reason: string;
    scheduledAt?: string;
  }) {
    return this.serviceControlService.executeControl({
      provider: '',
      accountId: '',
      configId: body.configId,
      action: body.action,
      reason: body.reason,
      executedBy: req.user.userId,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
    });
  }

  @Post('schedule-recovery')
  scheduleRecovery(@Request() req, @Body() body: {
    configId: string;
    scheduledFor: string;
  }) {
    return this.serviceControlService.scheduleRecovery(
      body.configId,
      new Date(body.scheduledFor),
    );
  }

  @Get('scheduled-recoveries/:configId')
  getScheduledRecoveries(@Param('configId') configId: string) {
    return this.serviceControlService.getScheduledRecoveries(configId);
  }

  @Delete('scheduled-recoveries/:recoveryId')
  cancelRecovery(@Param('recoveryId') recoveryId: string) {
    return this.serviceControlService.cancelRecovery(recoveryId);
  }
}
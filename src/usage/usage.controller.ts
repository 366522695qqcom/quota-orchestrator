import { Body, Controller, Post, Get, Query, UseGuards, Request, Param } from '@nestjs/common';
import { UsageService } from './usage.service';

@Controller('usage')
@UseGuards()
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Post('test')
  async testUsage(@Request() req, @Body() body: {
    provider: string;
    accountId: string;
    apiToken: string;
    extra?: Record<string, any>;
  }) {
    return this.usageService.fetchOnce(body.accountId, req.user.userId);
  }

  @Get('history/:configId')
  getHistory(
    @Request() req,
    @Param('configId') configId: string,
    @Query('limit') limit?: string,
  ) {
    return this.usageService.getHistory(
      configId,
      req.user.userId,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('alerts/:configId')
  getAlerts(
    @Request() req,
    @Param('configId') configId: string,
    @Query('limit') limit?: string,
  ) {
    return this.usageService.getAlerts(
      configId,
      req.user.userId,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('service-controls/:configId')
  getServiceControls(
    @Request() req,
    @Param('configId') configId: string,
    @Query('limit') limit?: string,
  ) {
    return this.usageService.getServiceControls(
      configId,
      req.user.userId,
      limit ? parseInt(limit) : 50,
    );
  }
}
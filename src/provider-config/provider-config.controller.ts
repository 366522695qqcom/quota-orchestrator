import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProviderConfigService } from './provider-config.service';
import {
  CreateProviderConfigDto,
  UpdateProviderConfigDto,
  QuotaRuleDto,
} from './provider-config.dto';

@Controller('provider-configs')
@UseGuards()
export class ProviderConfigController {
  constructor(private readonly providerConfigService: ProviderConfigService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateProviderConfigDto) {
    return this.providerConfigService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.providerConfigService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.providerConfigService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateProviderConfigDto,
  ) {
    return this.providerConfigService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.providerConfigService.remove(id, req.user.userId);
  }

  @Post(':id/quota-rules')
  createQuotaRule(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: QuotaRuleDto,
  ) {
    return this.providerConfigService.createQuotaRule(id, req.user.userId, dto);
  }

  @Get(':id/quota-rules')
  getQuotaRules(@Param('id') id: string, @Request() req) {
    return this.providerConfigService.getQuotaRules(id, req.user.userId);
  }

  @Put('quota-rules/:ruleId')
  updateQuotaRule(
    @Param('ruleId') ruleId: string,
    @Request() req,
    @Body() dto: Partial<QuotaRuleDto>,
  ) {
    return this.providerConfigService.updateQuotaRule(ruleId, req.user.userId, dto);
  }

  @Delete('quota-rules/:ruleId')
  deleteQuotaRule(@Param('ruleId') ruleId: string, @Request() req) {
    return this.providerConfigService.deleteQuotaRule(ruleId, req.user.userId);
  }

  @Post(':id/test')
  async testConfig(@Param('id') id: string, @Request() req) {
    return this.providerConfigService.testConfig(id, req.user.userId);
  }

  @Post(':id/cancel')
  async cancelConfig(@Param('id') id: string, @Request() req) {
    return this.providerConfigService.cancelConfig(id, req.user.userId);
  }
}
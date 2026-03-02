import { Controller, Get, Post, Delete, Param, UseGuards, Request, Res } from '@nestjs/common';
import { BackupService } from './backup.service';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/roles.guard';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('backup')
@UseGuards()
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async createBackup(@Request() req: any) {
    const filename = await this.backupService.createBackup();
    return { ok: true, filename };
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async listBackups() {
    const backups = await this.backupService.listBackups();
    return { ok: true, backups };
  }

  @Get('download/:filename')
  @Roles(UserRole.ADMIN)
  async downloadBackup(@Param('filename') filename: string, @Res() res: any) {
    const backupDir = process.env.BACKUP_DIR || './backups';
    const filepath = join(backupDir, filename);
    const file = createReadStream(filepath);
    file.pipe(res);
  }

  @Delete(':filename')
  @Roles(UserRole.ADMIN)
  async deleteBackup(@Param('filename') filename: string) {
    await this.backupService.deleteBackup(filename);
    return { ok: true };
  }

  @Post('restore/:filename')
  @Roles(UserRole.ADMIN)
  async restoreBackup(@Param('filename') filename: string) {
    await this.backupService.restoreBackup(filename);
    return { ok: true };
  }
}
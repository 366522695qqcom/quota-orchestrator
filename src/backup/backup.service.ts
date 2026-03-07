import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(private prisma: PrismaService) {}

  async createBackup(): Promise<string> {
    this.logger.log('Starting database backup...');
    const backupDir = process.env.BACKUP_DIR || './backups';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.db`;
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      const sourcePath = path.join(process.cwd(), 'prisma', 'dev.db');
      const targetPath = path.join(backupDir, filename);
      
      fs.copyFileSync(sourcePath, targetPath);
      
      const stats = fs.statSync(targetPath);
      this.logger.log(`Backup created: ${filename} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      
      return filename;
    } catch (error) {
      this.logger.error('Backup failed', error);
      throw new Error('Failed to create backup');
    }
  }

  async restoreBackup(filename: string): Promise<void> {
    this.logger.log(`Restoring from backup: ${filename}`);
    const backupDir = process.env.BACKUP_DIR || './backups';
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      const sourcePath = path.join(backupDir, filename);
      const targetPath = path.join(process.cwd(), 'prisma', 'dev.db');
      
      if (fs.existsSync(targetPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFilename = `pre-restore-backup-${timestamp}.db`;
        const backupPath = path.join(backupDir, backupFilename);
        
        fs.copyFileSync(targetPath, backupPath);
        
        fs.copyFileSync(sourcePath, targetPath);
        
        this.logger.log(`Backup restored: ${filename}`);
        this.logger.log(`Previous database backed up to: ${backupFilename}`);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
        
        this.logger.log(`Backup restored: ${filename}`);
      }
    } catch (error) {
      this.logger.error('Restore failed', error);
      throw new Error('Failed to restore backup');
    }
  }

  async listBackups(): Promise<Array<{ filename: string; size: string; createdAt: string }>> {
    const backupDir = process.env.BACKUP_DIR || './backups';
    const { readdirSync, statSync } = require('fs');
    
    try {
      const files = readdirSync(backupDir);
      const backups = files
        .filter((file) => file.startsWith('backup-') && file.endsWith('.db'))
        .map((filename) => {
          const filepath = `${backupDir}/${filename}`;
          const stats = statSync(filepath);
          return {
            filename,
            size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
            createdAt: filename.replace('backup-', '').replace('.db', '').replace(/-/g, ':'),
          };
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      
      return backups;
    } catch (error) {
      this.logger.error('Failed to list backups', error);
      return [];
    }
  }

  async deleteBackup(filename: string): Promise<void> {
    this.logger.log(`Deleting backup: ${filename}`);

    const backupDir = process.env.BACKUP_DIR || './backups';
    const { unlinkSync } = require('fs');

    try {
      const filepath = `${backupDir}/${filename}`;
      unlinkSync(filepath);
      this.logger.log(`Backup deleted: ${filename}`);
    } catch (error) {
      this.logger.error('Failed to delete backup', error);
      throw error;
    }
  }
}
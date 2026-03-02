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
    const filename = `backup-${timestamp}.sql`;

    try {
      const { exec } = require('child_process');
      return new Promise((resolve, reject) => {
        const command = `pg_dump ${process.env.DATABASE_URL} > ${backupDir}/${filename}`;
        this.logger.debug(`Executing: ${command}`);

        exec(command, (error, stdout, stderr) => {
          if (error) {
            this.logger.error(`Backup failed: ${error.message}`);
            reject(error);
          } else {
            this.logger.log(`Backup created: ${filename}`);
            this.logger.debug(`Backup size: ${stdout}`);
            resolve(filename);
          }
        });
      });
    } catch (error) {
      this.logger.error('Backup service not available', error);
      throw new Error('pg_dump is not available. Please install PostgreSQL client tools.');
    }
  }

  async restoreBackup(filename: string): Promise<void> {
    this.logger.log(`Restoring from backup: ${filename}`);

    const backupDir = process.env.BACKUP_DIR || './backups';

    try {
      const { exec } = require('child_process');
      return new Promise((resolve, reject) => {
        const command = `psql ${process.env.DATABASE_URL} < ${backupDir}/${filename}`;
        this.logger.debug(`Executing: ${command}`);

        exec(command, (error, stdout, stderr) => {
          if (error) {
            this.logger.error(`Restore failed: ${error.message}`);
            reject(error);
          } else {
            this.logger.log(`Backup restored: ${filename}`);
            resolve();
          }
        });
      });
    } catch (error) {
      this.logger.error('Restore service not available', error);
      throw new Error('psql is not available. Please install PostgreSQL client tools.');
    }
  }

  async listBackups(): Promise<Array<{ filename: string; size: string; createdAt: string }>> {
    const backupDir = process.env.BACKUP_DIR || './backups';
    const { readdirSync, statSync } = require('fs');

    try {
      const files = readdirSync(backupDir);
      const backups = files
        .filter((file) => file.startsWith('backup-') && file.endsWith('.sql'))
        .map((filename) => {
          const filepath = `${backupDir}/${filename}`;
          const stats = statSync(filepath);
          return {
            filename,
            size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
            createdAt: filename.replace('backup-', '').replace('.sql', '').replace(/-/g, ':'),
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
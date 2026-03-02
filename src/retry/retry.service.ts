import { Injectable, Logger } from '@nestjs/common';

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
}

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  async execute<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {},
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delayMs = 1000,
      backoffMultiplier = 2,
    } = options;

    let lastError: any;
    let currentDelay = delayMs;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.debug(`Attempt ${attempt}/${maxAttempts}`);
        return await fn();
      } catch (error: any) {
        lastError = error;
        this.logger.warn(
          `Attempt ${attempt}/${maxAttempts} failed: ${error?.message || String(error)}`,
        );

        if (attempt < maxAttempts) {
          this.logger.debug(`Waiting ${currentDelay}ms before retry...`);
          await this.sleep(currentDelay);
          currentDelay *= backoffMultiplier;
        }
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async executeWithRetry<T>(
    fn: () => Promise<T>,
    shouldRetry: (error: any) => boolean,
    options: RetryOptions = {},
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delayMs = 1000,
      backoffMultiplier = 2,
    } = options;

    let lastError: any;
    let currentDelay = delayMs;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.debug(`Attempt ${attempt}/${maxAttempts}`);
        return await fn();
      } catch (error) {
        lastError = error;

        if (!shouldRetry(error)) {
          throw error;
        }

        this.logger.warn(
          `Attempt ${attempt}/${maxAttempts} failed (retryable): ${error?.message || String(error)}`,
        );

        if (attempt < maxAttempts) {
          this.logger.debug(`Waiting ${currentDelay}ms before retry...`);
          await this.sleep(currentDelay);
          currentDelay *= backoffMultiplier;
        }
      }
    }

    throw lastError;
  }
}
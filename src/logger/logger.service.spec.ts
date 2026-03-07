import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  describe('sanitizeMessage', () => {
    it('should sanitize password in string', () => {
      const message = '{"password":"secret123"}';
      const spy = jest.spyOn(service as any, 'sanitizeMessage');
      const result = spy(message);

      expect(result).toContain('"password":"***"');
      expect(result).not.toContain('secret123');
    });

    it('should sanitize token in string', () => {
      const message = '{"token":"Bearer abc123"}';
      const spy = jest.spyOn(service as any, 'sanitizeMessage');
      const result = spy(message);

      expect(result).toContain('"token":"***"');
      expect(result).not.toContain('abc123');
    });

    it('should sanitize email in string', () => {
      const message = 'User email: test@example.com';
      const spy = jest.spyOn(service as any, 'sanitizeMessage');
      const result = spy(message);

      expect(result).toContain('***@***');
      expect(result).not.toContain('test@example.com');
    });

    it('should sanitize phone number in string', () => {
      const message = 'User phone: 13812345678';
      const spy = jest.spyOn(service as any, 'sanitizeMessage');
      const result = spy(message);

      expect(result).toContain('1***');
      expect(result).not.toContain('13812345678');
    });

    it('should sanitize API key in string', () => {
      const message = '{"apiKey":"sk_test_12345"}';
      const spy = jest.spyOn(service as any, 'sanitizeMessage');
      const result = spy(message);

      expect(result).toContain('"apiKey":"***"');
      expect(result).not.toContain('sk_test_12345');
    });

    it('should sanitize nested object', () => {
      const message = {
        user: {
          email: 'test@example.com',
          password: 'secret123',
          phone: '13812345678'
        }
      };
      const spy = jest.spyOn(service as any, 'sanitizeMessage');
      const result = spy(message);

      expect(result.user.email).toBe('***@***');
      expect(result.user.password).toBe('***');
      expect(result.user.phone).toBe('1***');
    });

    it('should not modify non-sensitive data', () => {
      const message = 'This is a normal message without sensitive data';
      const spy = jest.spyOn(service as any, 'sanitizeMessage');
      const result = spy(message);

      expect(result).toBe(message);
    });
  });

  describe('log methods', () => {
    it('should call info with sanitized message', () => {
      const loggerSpy = jest.spyOn((service as any).logger, 'info');
      service.log('User email: test@example.com');

      expect(loggerSpy).toHaveBeenCalled();
      const calledWith = loggerSpy.mock.calls[0][0];
      expect(calledWith).toContain('***@***');
      expect(calledWith).not.toContain('test@example.com');
    });

    it('should call error with sanitized message', () => {
      const loggerSpy = jest.spyOn((service as any).logger, 'error');
      service.error('Password: secret123');

      expect(loggerSpy).toHaveBeenCalled();
      const calledWith = loggerSpy.mock.calls[0][0];
      expect(calledWith).toContain('***');
      expect(calledWith).not.toContain('secret123');
    });

    it('should call warn with sanitized message', () => {
      const loggerSpy = jest.spyOn((service as any).logger, 'warn');
      service.warn('Token: abc123');

      expect(loggerSpy).toHaveBeenCalled();
      const calledWith = loggerSpy.mock.calls[0][0];
      expect(calledWith).toContain('***');
      expect(calledWith).not.toContain('abc123');
    });
  });
});

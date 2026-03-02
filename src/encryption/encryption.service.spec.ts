import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption/encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptionService],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  describe('encrypt', () => {
    it('should encrypt text', () => {
      const text = 'hello world';
      const encrypted = service.encrypt(text);

      expect(encrypted).toBeDefined();
      expect(encrypted).toContain(':');
      expect(encrypted).not.toBe(text);
    });

    it('should produce different encrypted values for same input', () => {
      const text = 'hello world';
      const encrypted1 = service.encrypt(text);
      const encrypted2 = service.encrypt(text);

      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted text', () => {
      const text = 'hello world';
      const encrypted = service.encrypt(text);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(text);
    });

    it('should throw error for invalid format', () => {
      expect(() => service.decrypt('invalid:format')).toThrow();
    });
  });

  describe('encrypt/decrypt roundtrip', () => {
    it('should maintain data integrity', () => {
      const originalText = 'sensitive-api-token-12345';
      const encrypted = service.encrypt(originalText);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(originalText);
    });
  });
});
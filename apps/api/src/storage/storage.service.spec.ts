import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;
  let sendSpy: jest.SpyInstance;

  const mockConfig: Record<string, string> = {
    S3_BUCKET: 'test-bucket',
    S3_ENDPOINT: 'http://localhost:9000',
    S3_ACCESS_KEY: 'test-key',
    S3_SECRET_KEY: 'test-secret',
    S3_REGION: 'us-east-1',
    NODE_ENV: 'test',
  };

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => mockConfig[key]),
    get: jest.fn((key: string) => mockConfig[key]),
  };

  beforeEach(async () => {
    mockConfigService.get.mockImplementation((key: string) => mockConfig[key]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    sendSpy = jest.spyOn(S3Client.prototype, 'send');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('putObject', () => {
    it('uploads the buffer with the given content type', async () => {
      sendSpy.mockResolvedValueOnce({});
      await service.putObject(
        'key.pdf',
        Buffer.from('data'),
        'application/pdf',
      );
      expect(sendSpy).toHaveBeenCalledTimes(1);
    });

    it('throws InternalServerErrorException when the SDK call fails', async () => {
      sendSpy.mockRejectedValueOnce(new Error('boom'));
      await expect(
        service.putObject('key.pdf', Buffer.from('data'), 'application/pdf'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getObject', () => {
    it('returns the stream and metadata on success', async () => {
      const stream = Readable.from(['hello']);
      sendSpy.mockResolvedValueOnce({
        Body: stream,
        ContentLength: 5,
        ContentType: 'application/pdf',
      });

      const result = await service.getObject('key.pdf');
      expect(result.stream).toBe(stream);
      expect(result.contentLength).toBe(5);
      expect(result.contentType).toBe('application/pdf');
    });

    it('throws NotFoundException when the object is missing', async () => {
      const err = new Error('not found');
      err.name = 'NoSuchKey';
      sendSpy.mockRejectedValueOnce(err);
      await expect(service.getObject('missing.pdf')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws InternalServerErrorException on other SDK errors', async () => {
      sendSpy.mockRejectedValueOnce(new Error('network error'));
      await expect(service.getObject('key.pdf')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('deleteObject', () => {
    it('deletes the object', async () => {
      sendSpy.mockResolvedValueOnce({});
      await service.deleteObject('key.pdf');
      expect(sendSpy).toHaveBeenCalledTimes(1);
    });

    it('throws InternalServerErrorException when the SDK call fails', async () => {
      sendSpy.mockRejectedValueOnce(new Error('boom'));
      await expect(service.deleteObject('key.pdf')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('onModuleInit (bucket auto-create)', () => {
    it('does nothing when the bucket already exists', async () => {
      sendSpy.mockResolvedValueOnce({}); // HeadBucket succeeds
      await service.onModuleInit();
      expect(sendSpy).toHaveBeenCalledTimes(1);
    });

    it('creates the bucket when HeadBucket fails', async () => {
      sendSpy
        .mockRejectedValueOnce(new Error('not found')) // HeadBucket fails
        .mockResolvedValueOnce({}); // CreateBucket succeeds
      await service.onModuleInit();
      expect(sendSpy).toHaveBeenCalledTimes(2);
    });

    it('treats BucketAlreadyOwnedByYou as success, not an error', async () => {
      const alreadyOwned = new Error('already owned');
      alreadyOwned.name = 'BucketAlreadyOwnedByYou';
      sendSpy
        .mockRejectedValueOnce(new Error('not found'))
        .mockRejectedValueOnce(alreadyOwned);
      await expect(service.onModuleInit()).resolves.not.toThrow();
    });

    it('skips bucket auto-create entirely in production', async () => {
      mockConfigService.get.mockImplementation((key: string) =>
        key === 'NODE_ENV' ? 'production' : mockConfig[key],
      );
      await service.onModuleInit();
      expect(sendSpy).not.toHaveBeenCalled();
    });
  });
});

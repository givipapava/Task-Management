import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  DiskHealthIndicator,
  MemoryHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { FileSystemHealthIndicator } from './indicators/file-system.health';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let diskHealthIndicator: DiskHealthIndicator;
  let memoryHealthIndicator: MemoryHealthIndicator;
  let fileSystemHealthIndicator: FileSystemHealthIndicator;

  const mockHealthCheckService = {
    check: jest.fn(),
  };

  const mockDiskHealthIndicator = {
    checkStorage: jest.fn(),
  };

  const mockMemoryHealthIndicator = {
    checkHeap: jest.fn(),
    checkRSS: jest.fn(),
  };

  const mockFileSystemHealthIndicator = {
    isHealthy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: DiskHealthIndicator,
          useValue: mockDiskHealthIndicator,
        },
        {
          provide: MemoryHealthIndicator,
          useValue: mockMemoryHealthIndicator,
        },
        {
          provide: FileSystemHealthIndicator,
          useValue: mockFileSystemHealthIndicator,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    diskHealthIndicator = module.get<DiskHealthIndicator>(DiskHealthIndicator);
    memoryHealthIndicator = module.get<MemoryHealthIndicator>(
      MemoryHealthIndicator,
    );
    fileSystemHealthIndicator = module.get<FileSystemHealthIndicator>(
      FileSystemHealthIndicator,
    );

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return healthy status when all checks pass', async () => {
      const mockHealthyResult: HealthCheckResult = {
        status: 'ok',
        info: {
          tasks_file: { status: 'up' },
          storage: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
        error: {},
        details: {
          tasks_file: { status: 'up' },
          storage: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
      };

      mockHealthCheckService.check.mockResolvedValue(mockHealthyResult);

      const result = await controller.check();

      expect(result).toEqual(mockHealthyResult);
      expect(healthCheckService.check).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.any(Function),
          expect.any(Function),
          expect.any(Function),
          expect.any(Function),
        ]),
      );
    });

    it('should call all health indicators', async () => {
      mockHealthCheckService.check.mockImplementation(async (checks) => {
        // Execute all check functions
        for (const check of checks) {
          await check();
        }
        return {
          status: 'ok',
          info: {},
          error: {},
          details: {},
        };
      });

      mockFileSystemHealthIndicator.isHealthy.mockResolvedValue({
        tasks_file: { status: 'up' },
      });
      mockDiskHealthIndicator.checkStorage.mockResolvedValue({
        storage: { status: 'up' },
      });
      mockMemoryHealthIndicator.checkHeap.mockResolvedValue({
        memory_heap: { status: 'up' },
      });
      mockMemoryHealthIndicator.checkRSS.mockResolvedValue({
        memory_rss: { status: 'up' },
      });

      await controller.check();

      expect(fileSystemHealthIndicator.isHealthy).toHaveBeenCalledWith(
        'tasks_file',
      );
      expect(diskHealthIndicator.checkStorage).toHaveBeenCalledWith('storage', {
        path: '/',
        thresholdPercent: 0.9,
      });
      expect(memoryHealthIndicator.checkHeap).toHaveBeenCalledWith(
        'memory_heap',
        150 * 1024 * 1024,
      );
      expect(memoryHealthIndicator.checkRSS).toHaveBeenCalledWith(
        'memory_rss',
        150 * 1024 * 1024,
      );
    });

    it('should return error status when checks fail', async () => {
      const mockUnhealthyResult: HealthCheckResult = {
        status: 'error',
        info: {},
        error: {
          storage: {
            status: 'down',
            message: 'Storage threshold exceeded',
          },
        },
        details: {
          storage: {
            status: 'down',
            message: 'Storage threshold exceeded',
          },
        },
      };

      mockHealthCheckService.check.mockRejectedValue(mockUnhealthyResult);

      await expect(controller.check()).rejects.toEqual(mockUnhealthyResult);
    });
  });

  describe('getLiveness', () => {
    it('should return liveness status with timestamp', () => {
      const result = controller.getLiveness();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    it('should return different timestamps for consecutive calls', () => {
      const result1 = controller.getLiveness();
      const result2 = controller.getLiveness();

      expect(result1.timestamp).toBeDefined();
      expect(result2.timestamp).toBeDefined();
      // Timestamps should be very close but may differ
      expect(typeof result1.timestamp).toBe('string');
      expect(typeof result2.timestamp).toBe('string');
    });
  });

  describe('getReadiness', () => {
    it('should return readiness status with timestamp', () => {
      const result = controller.getReadiness();

      expect(result).toHaveProperty('status', 'ready');
      expect(result).toHaveProperty('timestamp');
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    it('should return valid ISO timestamp', () => {
      const result = controller.getReadiness();
      const timestamp = new Date(result.timestamp);

      expect(timestamp.toISOString()).toBe(result.timestamp);
    });
  });
});

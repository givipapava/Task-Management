import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TaskPriority, TaskStatus, TaskCategory } from '../src/tasks/task.entity';

describe('Tasks API (e2e)', () => {
  let app: INestApplication;
  let createdTaskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same pipes as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/tasks (POST)', () => {
    it('should create a new task', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .send({
          title: 'E2E Test Task',
          description: 'Test description',
          priority: TaskPriority.HIGH,
          category: TaskCategory.WORK,
          dueDate: '2025-12-31T23:59:59.000Z',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('E2E Test Task');
          expect(res.body.priority).toBe(TaskPriority.HIGH);
          expect(res.body.status).toBe(TaskStatus.PENDING);
          createdTaskId = res.body.id;
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .send({
          description: 'Missing title',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Title is required');
        });
    });

    it('should validate priority enum', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .send({
          title: 'Test',
          priority: 'invalid',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Priority must be high, medium, or low');
        });
    });

    it('should validate ISO 8601 date format', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .send({
          title: 'Test',
          priority: TaskPriority.MEDIUM,
          dueDate: 'invalid-date',
        })
        .expect(400);
    });

    it('should trim whitespace from title', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .send({
          title: '  Trimmed Task  ',
          priority: TaskPriority.LOW,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toBe('Trimmed Task');
        });
    });
  });

  describe('/api/tasks (GET)', () => {
    it('should return all tasks', () => {
      return request(app.getHttpServer())
        .get('/api/tasks')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/api/tasks/:id (GET)', () => {
    it('should return a single task', () => {
      return request(app.getHttpServer())
        .get(`/api/tasks/${createdTaskId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdTaskId);
          expect(res.body).toHaveProperty('title');
          expect(res.body).toHaveProperty('priority');
        });
    });

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .get('/api/tasks/non-existent-id')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('Task with ID non-existent-id not found');
        });
    });
  });

  describe('/api/tasks/:id (PUT)', () => {
    it('should update a task', () => {
      return request(app.getHttpServer())
        .put(`/api/tasks/${createdTaskId}`)
        .send({
          title: 'Updated Task',
          status: TaskStatus.IN_PROGRESS,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Task');
          expect(res.body.status).toBe(TaskStatus.IN_PROGRESS);
          expect(res.body.id).toBe(createdTaskId);
        });
    });

    it('should return 404 when updating non-existent task', () => {
      return request(app.getHttpServer())
        .put('/api/tasks/non-existent-id')
        .send({
          title: 'Updated',
        })
        .expect(404);
    });

    it('should validate enum values on update', () => {
      return request(app.getHttpServer())
        .put(`/api/tasks/${createdTaskId}`)
        .send({
          status: 'invalid-status',
        })
        .expect(400);
    });
  });

  describe('/api/tasks/:id (DELETE)', () => {
    it('should delete a task', () => {
      return request(app.getHttpServer())
        .delete(`/api/tasks/${createdTaskId}`)
        .expect(204);
    });

    it('should return 404 when deleting non-existent task', () => {
      return request(app.getHttpServer())
        .delete('/api/tasks/non-existent-id')
        .expect(404);
    });

    it('should confirm task is deleted', () => {
      return request(app.getHttpServer())
        .get(`/api/tasks/${createdTaskId}`)
        .expect(404);
    });
  });

  describe('Health Checks', () => {
    it('/health (GET) should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect((res) => {
          expect([200, 503]).toContain(res.status);
        });
    });

    it('/health/live (GET) should return liveness status', () => {
      return request(app.getHttpServer())
        .get('/health/live')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
        });
    });

    it('/health/ready (GET) should return readiness status', () => {
      return request(app.getHttpServer())
        .get('/health/ready')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ready');
        });
    });
  });
});

# Testing Documentation

Comprehensive testing guide for the Task Management API backend.

## Testing Strategy

### Test Pyramid
- **Unit Tests**: 60% - Test individual components in isolation
- **Integration Tests**: 30% - Test component interactions
- **E2E Tests**: 10% - Test complete user workflows

### Coverage Goals
- **Overall Coverage**: >80%
- **Service Layer**: >90%
- **Controller Layer**: >80%
- **Critical Paths**: 100%

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:cov
```

This generates a coverage report in `coverage/` directory.

### E2E Tests
```bash
npm run test:e2e
```

### Debug Mode
```bash
npm run test:debug
```

## Test Files Structure

```
backend/
├── src/
│   └── tasks/
│       └── tasks.service.spec.ts    # Unit tests
└── test/
    ├── jest-e2e.json                # E2E config
    └── tasks.e2e-spec.ts            # E2E tests
```

## Unit Tests

### TasksService Tests

**File**: `src/tasks/tasks.service.spec.ts`

Tests cover:
- ✅ Finding all tasks
- ✅ Finding task by ID
- ✅ Creating tasks
- ✅ Updating tasks
- ✅ Deleting tasks
- ✅ File system error handling
- ✅ Directory creation
- ✅ Not found exceptions

**Example Test**:
```typescript
it('should return an array of tasks', async () => {
  (fs.readFile as jest.Mock).mockResolvedValue(
    JSON.stringify({ tasks: mockTasks }),
  );

  const result = await service.findAll();

  expect(result).toEqual(mockTasks);
  expect(fs.readFile).toHaveBeenCalled();
});
```

## E2E Tests

### Tasks API Tests

**File**: `test/tasks.e2e-spec.ts`

Tests cover:
- ✅ POST /api/tasks - Create task
- ✅ GET /api/tasks - Get all tasks
- ✅ GET /api/tasks/:id - Get single task
- ✅ PUT /api/tasks/:id - Update task
- ✅ DELETE /api/tasks/:id - Delete task
- ✅ Input validation
- ✅ Error responses
- ✅ Health check endpoints

**Example E2E Test**:
```typescript
it('should create a new task', () => {
  return request(app.getHttpServer())
    .post('/api/tasks')
    .send({
      title: 'E2E Test Task',
      priority: TaskPriority.HIGH,
    })
    .expect(201)
    .expect((res) => {
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('E2E Test Task');
    });
});
```

## Test Coverage Report

Run `npm run test:cov` to see:

```
File                       | % Stmts | % Branch | % Funcs | % Lines
---------------------------|---------|----------|---------|--------
All files                  |   42.54 |    34.61 |   37.14 |   42.85
tasks.service.ts           |   97.46 |       90 |     100 |   97.29
```

## Mocking Strategy

### File System Mocking
```typescript
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    access: jest.fn(),
    mkdir: jest.fn(),
  },
}));
```

### Testing Error Scenarios
```typescript
it('should throw NotFoundException', async () => {
  (fs.readFile as jest.Mock).mockResolvedValue(
    JSON.stringify({ tasks: [] }),
  );

  await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
});
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` to reset state
- Clear mocks between tests

### 2. Descriptive Test Names
```typescript
it('should return 404 when task not found', async () => {
  // Test implementation
});
```

### 3. AAA Pattern
- **Arrange**: Set up test data
- **Act**: Execute the function
- **Assert**: Verify the result

### 4. Test Edge Cases
- Empty arrays
- Null/undefined values
- Invalid input
- Network errors
- File system errors

## Validation Testing

Tests verify:
- ✅ Required fields enforcement
- ✅ Enum validation (priority, status, category)
- ✅ ISO 8601 date format
- ✅ String length limits (title: 200, description: 1000)
- ✅ Input sanitization (whitespace trimming)

## Health Check Testing

Tests verify:
- ✅ `/health` - Comprehensive health check
- ✅ `/health/live` - Liveness probe
- ✅ `/health/ready` - Readiness probe

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run test:cov
```

## Troubleshooting

### Tests Failing to Start
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Coverage Not Generating
```bash
# Ensure coverage directory exists
mkdir -p coverage

# Run with verbose output
npm run test:cov -- --verbose
```

### E2E Tests Timing Out
- Increase timeout in jest-e2e.json
- Check if test database/files are accessible
- Verify no port conflicts

## Adding New Tests

### Unit Test Template
```typescript
describe('FeatureName', () => {
  let service: ServiceName;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ServiceName],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
  });

  it('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = service.method(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### E2E Test Template
```typescript
it('should perform action', () => {
  return request(app.getHttpServer())
    .post('/api/endpoint')
    .send({ data: 'value' })
    .expect(201)
    .expect((res) => {
      expect(res.body).toHaveProperty('id');
    });
});
```

## Test Data Management

### Mock Data
- Keep mock data in separate files for reusability
- Use factories for complex test data
- Reset test data between tests

### Test Database
- Use separate test environment
- Clean up test data after each test
- Use transactions for rollback

## Performance Testing

While not included in current setup, consider adding:
- Load testing with Artillery or k6
- Benchmark tests for critical operations
- Memory leak detection

## Resources

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

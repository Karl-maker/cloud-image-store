# Testing Setup

This directory contains comprehensive tests for the Cloud Image Server application.

## Test Structure

### Mock Services
- `mocks/mock.upload.service.ts` - Mock S3 upload service
- `mocks/mock.email.service.ts` - Mock email service (replaces nodemailer)
- `mocks/mock.stripe.service.ts` - Mock Stripe service for payments

### Mock Repositories
- `mock.user.repository.ts` - In-memory user repository for testing
- `mock.space.repository.ts` - In-memory space repository for testing
- `mock.content.repository.ts` - In-memory content repository for testing

### Test Server
- `test.server.ts` - Express server configured with all mock services for E2E testing

### Test Files
- `user.integration.test.ts` - Comprehensive user functionality tests
- `run-tests.ts` - Test runner script

## Running Tests

### Integration Tests (Recommended)
```bash
npm run test:integration
# or
pnpm test:integration
```

This runs the custom test suite that tests all user functionalities with mocked services.

### Jest Tests (Requires Jest setup)
```bash
npm test
# or
pnpm test
```

## Test Coverage

The integration tests cover:

### User Management
- ✅ User registration with validation
- ✅ User login and authentication
- ✅ Profile management (get/update)
- ✅ Email confirmation flow
- ✅ Password recovery flow
- ✅ User search and pagination

### Email Services
- ✅ Confirmation email sending
- ✅ Recovery email sending
- ✅ Email template handling

### Payment Services (Stripe)
- ✅ Customer creation
- ✅ Subscription management
- ✅ Payment processing

### Repository Operations
- ✅ CRUD operations
- ✅ Pagination
- ✅ Filtering
- ✅ Sorting

## Test Utilities

The `setup.ts` file provides:
- `testUtils.generateTestUser()` - Generate test user data
- `testUtils.generateTestSpace()` - Generate test space data
- `testUtils.generateTestContent()` - Generate test content data

## Mock Services Features

### Mock Email Service
- Tracks sent emails for verification
- `getSentEmails()` - Get all sent emails
- `clearSentEmails()` - Clear email history
- `getEmailsTo(email)` - Get emails sent to specific address

### Mock Stripe Service
- Simulates Stripe API responses
- Tracks customers and subscriptions
- `getCustomerCount()` - Get number of created customers
- `getSubscriptionCount()` - Get number of subscriptions
- `clearAllData()` - Clear all mock data

### Mock Repositories
- In-memory storage for testing
- Implements full repository interface
- Supports pagination, filtering, and sorting
- `clearAllData()` - Reset to empty state

## Adding New Tests

1. Create new test functions in `user.integration.test.ts`
2. Use the `TestRunner` class to organize tests
3. Use the `expect()` helper for assertions
4. Add test data using `testUtils` helpers
5. Verify results using mock service methods

## Example Test

```typescript
runner.test('Should create user successfully', async () => {
    const user = testUtils.generateTestUser();
    await server.mockUserRepository.save(user);
    
    const users = await server.mockUserRepository.findMany();
    expect(users.data).toHaveLength(1);
    expect(users.data[0].email).toBe(user.email);
});
```

## Environment Setup

Create a `.env.test` file for test-specific environment variables:

```env
# Test environment variables
NODE_ENV=test
TOKEN_SECRET=test-secret
API_KEY_SECRET=test-api-secret
```

## Benefits of This Testing Approach

1. **Fast Execution** - No external dependencies
2. **Reliable** - No network calls or external services
3. **Comprehensive** - Tests all layers of the application
4. **Maintainable** - Clear separation of concerns
5. **Realistic** - Tests actual business logic flows
6. **Isolated** - Each test runs in clean state 
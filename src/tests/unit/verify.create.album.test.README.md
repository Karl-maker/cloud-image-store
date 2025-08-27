# VerifyCreateAlbum Middleware Unit Tests

This document describes the comprehensive unit test suite for the `verifyCreateAlbum` middleware, which handles space creation permission validation based on user quotas and existing space counts.

## Test Coverage

The test suite covers all major functionality of the `verifyCreateAlbum` middleware:

### 1. Successful Validation (3 tests)
- ✅ **User with space quota available**: Returns true when user exists and has space quota available
- ✅ **User with no spaces**: Returns true when user has no spaces and quota available
- ✅ **User at quota limit**: Returns true when user has exactly maxSpaces-1 spaces

### 2. Error Handling (3 tests)
- ✅ **User not found**: Throws `NotFoundException` when user not found
- ✅ **Space limit reached**: Throws `InsufficentStorageException` when user has reached space limit
- ✅ **Space limit exceeded**: Throws `InsufficentStorageException` when user has exceeded space limit

### 3. Edge Cases (5 tests)
- ✅ **maxSpaces = 0**: Handles user with zero space quota
- ✅ **maxSpaces = 1, no spaces**: Handles user with single space quota and no existing spaces
- ✅ **maxSpaces = 1, one space**: Handles user with single space quota and one existing space
- ✅ **High space limits**: Handles user with very high maxSpaces limit (1000)
- ✅ **Exact quota match**: Handles user with exactly 1000 spaces and 1000 space quota

### 4. Repository Error Handling (3 tests)
- ✅ **User repository error**: Handles errors when `userRepository.findById` throws
- ✅ **Space repository error**: Handles errors when `spaceRepository.findMany` throws
- ✅ **Both repositories error**: Handles errors when both repositories throw

### 5. Request Validation (4 tests)
- ✅ **No user**: Handles request without user object
- ✅ **User without ID**: Handles request with user but no id property
- ✅ **Null user**: Handles request with null user
- ✅ **Undefined user**: Handles request with undefined user

### 6. Pagination Edge Cases (3 tests)
- ✅ **String totalItems**: Handles pagination with totalItems as string
- ✅ **Zero totalItems**: Handles pagination with totalItems as 0
- ✅ **Missing totalItems**: Handles pagination with missing totalItems property

### 7. Concurrent Requests (1 test)
- ✅ **Multiple requests**: Handles multiple concurrent requests for the same user

## Test Architecture

### Mock Strategy
- **Request Mock**: Partial Express Request with user object containing id
- **Response Mock**: Empty object (not used in middleware)
- **Next Function Mock**: Jest mock function to capture calls
- **Repository Mocks**: Mocked `SpaceRepository` and `UserRepository` with jest.fn()
- **User Mock**: Complete User entity with all required properties
- **Space Mock**: Space entities with basic properties
- **Pagination Mock**: Complete pagination object with all required fields

### Test Structure
- **BeforeEach**: Resets all mocks to default state for each test
- **Organized by Functionality**: Tests grouped by validation success, error handling, edge cases
- **Comprehensive Coverage**: Tests both positive and negative scenarios
- **Error Propagation**: Validates that errors are properly passed to next()

## Key Testing Patterns

### 1. Space Quota Validation
```typescript
// Tests the logic: if(user.maxSpaces <= results.pagination.totalItems) throw InsufficentStorageException
// Validates that users cannot exceed their space quota
```

### 2. User Existence Validation
```typescript
// Tests the logic: if(!user) throw NotFoundException('user not found')
// Validates that users must exist to create spaces
```

### 3. Repository Integration
```typescript
// Tests repository calls with correct parameters
// Validates that spaceRepository.findMany is called with user ID filter
// Validates that userRepository.findById is called with user ID
```

### 4. Error Handling
```typescript
// Tests that exceptions are properly caught and passed to next()
// Validates error message content and exception types
```

## Test Results

- **Total Tests**: 22
- **Passing**: 22
- **Failing**: 0
- **Coverage**: Comprehensive coverage of all methods, error scenarios, and edge cases

## Running the Tests

```bash
# Run all tests
npm test -- src/tests/unit/verify.create.album.test.ts

# Run specific test
npm test -- src/tests/unit/verify.create.album.test.ts --testNamePattern="successful validation"
```

## Notes

- The middleware uses `(req as any).user?.id` to extract user ID from request
- Space validation is based on `user.maxSpaces <= results.pagination.totalItems`
- The middleware calls `spaceRepository.findMany` with `createdByUserId` filter
- All exceptions are caught in try-catch and passed to `next(error)`
- The middleware supports both single and multiple space quota scenarios
- Pagination structure must include `totalItems`, `currentPage`, `pageSize`, and `totalPages`

## Business Logic Validated

1. **Space Quota Enforcement**: Users cannot create more spaces than their `maxSpaces` limit
2. **User Authentication**: Requests must include a valid user with ID
3. **Database Integration**: Proper repository calls with correct filters
4. **Error Handling**: Graceful handling of database errors and validation failures
5. **Edge Case Handling**: Zero quotas, exact quota matches, missing data
6. **Concurrent Safety**: Multiple requests handled correctly

## Future Enhancements

1. **Integration Tests**: Add tests with real Express middleware chain
2. **Performance Tests**: Add tests for large space counts
3. **Security Tests**: Add tests for unauthorized access attempts
4. **Database Tests**: Add tests with real database connections
5. **Load Testing**: Add tests for high-concurrency scenarios

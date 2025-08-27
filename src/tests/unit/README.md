# Unit Tests for Usecases Class

This directory contains comprehensive unit tests for the `Usecases` abstract class, which serves as the base class for all usecase implementations in the application.

## Test Coverage

The tests cover all public methods of the `Usecases` class:

### 1. `create` Method
- ✅ Creates a new entity successfully
- ✅ Handles creation with minimal data (default values)
- ✅ Maps DTO to entity correctly
- ✅ Saves entity through repository

### 2. `update` Method
- ✅ Updates an existing entity successfully
- ✅ Throws `HttpException` when entity does not exist
- ✅ Updates only provided fields (partial updates)
- ✅ Preserves existing values for non-provided fields
- ✅ Maps update DTO to entity correctly

### 3. `findById` Method
- ✅ Finds entity by ID successfully
- ✅ Throws `HttpException` when entity does not exist
- ✅ Returns the correct entity

### 4. `findMany` Method
- ✅ Returns all entities with default pagination
- ✅ Handles pagination correctly (page size, page number)
- ✅ Handles sorting parameters (sort by, sort order)
- ✅ Handles filters correctly
- ✅ Handles complex filter parameters
- ✅ Processes filters using `convertToFilters` utility

### 5. `deleteById` Method
- ✅ Deletes entity successfully
- ✅ Throws `HttpException` when entity does not exist
- ✅ Handles repository delete errors
- ✅ Throws error when repository delete fails

### 6. Edge Cases
- ✅ Handles empty repository in findMany
- ✅ Handles null/undefined parameters gracefully
- ✅ Handles empty string filters
- ✅ Processes filters correctly with the updated `convertToFilters` utility

## Test Structure

### Mock Implementation
- **TestEntity**: A mock entity that extends `Persistent` interface
- **MockRepository**: A complete mock implementation of the `Repository` interface
- **TestUsecases**: A concrete implementation of the abstract `Usecases` class for testing

### Test Utilities
- **addEntity()**: Helper method to add entities to mock repository
- **clearEntities()**: Helper method to clear mock repository state
- **beforeEach/afterEach**: Proper test isolation

## Key Improvements Made

### 1. Fixed `convertToFilters` Utility
- Added handling for `undefined`, `null`, and empty string values
- Prevents these values from being processed as filters

### 2. Fixed Usecase Return Type
- Changed `findById` return type from `Promise<Entity | E>` to `Promise<Entity>`
- Ensures consistent return type behavior

### 3. Fixed Jest Configuration
- Corrected `moduleNameMapping` to `moduleNameMapper` in jest.config.js
- Eliminated configuration warnings

### 4. Comprehensive Test Coverage
- Tests all public methods
- Tests both success and error scenarios
- Tests edge cases and boundary conditions
- Tests filter processing logic

## Running the Tests

```bash
# Run all unit tests
npm test

# Run only usecase tests
npm test -- src/tests/unit/usecases.test.ts

# Run with coverage
npm run test:coverage
```

## Test Results

All 18 tests pass successfully, providing comprehensive coverage of the `Usecases` class functionality:

- ✅ 18 tests passed
- ✅ 0 tests failed
- ✅ Full coverage of all public methods
- ✅ Error handling tested
- ✅ Edge cases covered

## Dependencies

The tests use the following testing framework and utilities:
- **Jest**: Testing framework
- **TypeScript**: Type checking
- **Mock implementations**: For repository and entity testing
- **Exception classes**: For error testing

## Notes

- The tests focus on the logic of the usecase class, not the actual repository implementations
- All external dependencies are properly mocked
- The tests ensure that the usecase class behaves correctly regardless of the underlying repository implementation
- Error handling is thoroughly tested to ensure proper exception propagation

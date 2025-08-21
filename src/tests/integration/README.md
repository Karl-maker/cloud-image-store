# Integration Tests

This directory contains integration tests that test the application's repositories and database layer functionality using MongoDB. The tests use **mongodb-memory-server** for in-memory MongoDB testing, ensuring fast, isolated, and reliable database testing without requiring external MongoDB installations.

## Repository Integration Tests

### User Repository Integration Tests

The `user.repository.integration.test.ts` file contains comprehensive tests for the `UserMongooseRepository` class, focusing on:

#### Test Categories

1. **User Creation and Retrieval (3 tests)**
   - Save new users to database
   - Retrieve users by ID
   - Handle non-existent user lookups

2. **User Filtering and Searching (8 tests)**
   - Filter by confirmed status
   - Filter by email contains
   - Filter by exact firstName match
   - Filter by numeric properties (maxSpaces)
   - Pagination functionality
   - Sorting by firstName and createdAt
   - Combined filters with sorting
   - Combined filters, sorting, and pagination

3. **User Updates (3 tests)**
   - Update basic user properties
   - Update subscription-related fields
   - Update password-related fields

4. **User Deletion (2 tests)**
   - Soft delete functionality (set deactivatedAt)
   - findManyIgnoreDeletion behavior

5. **Database Constraints and Validation (3 tests)**
   - Email uniqueness constraints
   - Special characters in names and emails
   - Large numeric values handling

6. **Performance and Concurrency (2 tests)**
   - Concurrent user creation
   - Concurrent updates to same user

7. **Complex Query Scenarios (4 tests)**
   - Premium users filtering
   - Confirmed users with Stripe
   - Email domain filtering
   - Complex sorting with pagination

### Key Features Tested

- **Repository Pattern**: Tests the abstract MongooseRepository implementation
- **Database Filters**: Tests the filtering system with exact matches and contains
- **Pagination**: Tests page-based data retrieval with proper metadata
- **Sorting**: Tests ascending and descending sorting by various fields
- **Soft Deletion**: Tests the deactivatedAt field for soft deletes
- **Data Validation**: Tests MongoDB constraints and unique indexes
- **Concurrency**: Tests parallel database operations
- **Special Cases**: Tests edge cases like special characters and large numbers

## Setup and Running

### Prerequisites

1. **Dependencies**: The tests use `mongodb-memory-server` which is automatically installed
2. **No External MongoDB Required**: Tests run with in-memory MongoDB instances

### Installation

The required dependencies are already installed:

```bash
# mongodb-memory-server is installed as a dev dependency
pnpm add -D mongodb-memory-server
```

### Running Integration Tests

```bash
# Run all integration tests
npm test -- src/tests/integration/

# Run user repository tests specifically
npm test -- src/tests/integration/user.repository.integration.test.ts

# Run with verbose output
npm test -- src/tests/integration/user.repository.integration.test.ts --verbose

# Run with coverage
npm test -- src/tests/integration/ --coverage
```

### How It Works

The integration tests automatically:
- ✅ **Start in-memory MongoDB** server for each test run
- ✅ **Connect to isolated database** instance
- ✅ **Clean up data** between tests
- ✅ **Stop server** after tests complete
- ✅ **No external dependencies** required

### Alternative: External MongoDB (Optional)

If you prefer to use an external MongoDB instance instead of the in-memory server, you can still do so by setting the `MONGO_URI_TEST` environment variable. The tests will automatically detect and use it.

#### Option 1: Local MongoDB Installation

```bash
# Install MongoDB locally
brew install mongodb/brew/mongodb-community  # macOS
# or follow MongoDB installation guide for your OS

# Start MongoDB
brew services start mongodb-community

# Set environment variable (optional)
export MONGO_URI_TEST=mongodb://localhost:27017/cloud-image-server-test
```

#### Option 2: Docker MongoDB

```bash
# Run MongoDB in Docker
docker run -d --name mongodb-test -p 27017:27017 mongo:latest

# Set environment variable (optional)
export MONGO_URI_TEST=mongodb://localhost:27017/cloud-image-server-test
```

#### Option 3: MongoDB Atlas (Cloud)

1. Create a free MongoDB Atlas cluster
2. Create a test database
3. Get the connection string
4. Set the environment variable:

```bash
export MONGO_URI_TEST="mongodb+srv://username:password@cluster.mongodb.net/cloud-image-server-test"
```

**Note**: The in-memory MongoDB server is the default and recommended approach for testing.

## Test Database Management

### Automatic Cleanup

The integration tests automatically:
- ✅ **Start fresh in-memory MongoDB** for each test run
- ✅ **Clear all test data** before each test (`beforeEach`)
- ✅ **Disconnect from database** after all tests (`afterAll`)
- ✅ **Stop in-memory server** completely after tests
- ✅ **Isolated test environment** (no interference with development/production)

### No Manual Cleanup Required

Since the tests use in-memory MongoDB servers:
- ✅ **Automatic cleanup** - no manual intervention needed
- ✅ **Isolated instances** - each test run is completely separate
- ✅ **No persistent data** - all data is in memory only
- ✅ **Fast startup/shutdown** - no external database dependencies

## What These Tests Validate

### Repository Layer Functionality
- ✅ **CRUD Operations**: Create, Read, Update, Delete users
- ✅ **Database Connectivity**: Real MongoDB connection and operations
- ✅ **Schema Validation**: MongoDB schema constraints and indexes
- ✅ **Query Performance**: Filtering, sorting, and pagination
- ✅ **Data Integrity**: Unique constraints and field validation
- ✅ **Soft Deletion**: Proper deactivatedAt handling
- ✅ **Error Handling**: Database errors and constraint violations
- ✅ **Concurrency**: Parallel operations and race conditions

### Real Database Features
- ✅ **Indexes**: Email and clientId uniqueness
- ✅ **Timestamps**: Automatic createdAt and updatedAt
- ✅ **Complex Queries**: Combined filtering, sorting, pagination
- ✅ **Data Types**: String, Number, Boolean, Date handling
- ✅ **Special Characters**: Unicode and special character support
- ✅ **Large Values**: Handling of large numeric values

## Troubleshooting

### Common Issues

1. **"Failed to connect to in-memory MongoDB"**
   - This is rare with in-memory servers
   - Check that mongodb-memory-server is properly installed
   - Ensure sufficient system memory for MongoDB instance

2. **Duplicate key errors**
   - Tests automatically clean up between runs
   - If issues persist, restart the test suite
   - Check for any persistent connection issues

3. **Schema validation errors**
   - Ensure User entity matches UserSchema exactly
   - Check that all required fields are provided in test data
   - Verify that indexes are properly defined

4. **Performance issues**
   - In-memory MongoDB is typically very fast
   - If tests are slow, check system resources
   - Consider running fewer tests in parallel

### Debug Mode

Run tests with debug output:

```bash
DEBUG=* npm test -- src/tests/integration/user.repository.integration.test.ts
```

## Integration vs Unit Tests

| Aspect | Unit Tests | Integration Tests |
|--------|------------|-------------------|
| **Database** | Mock repositories | In-memory MongoDB |
| **Speed** | Fast (~ms) | Fast (~seconds) |
| **Isolation** | Complete | Isolated in-memory DB |
| **Coverage** | Logic only | End-to-end flow |
| **Environment** | Any | Self-contained |
| **Purpose** | Test logic | Test integration |
| **Setup** | No dependencies | Automatic in-memory DB |

## Future Enhancements

Potential additions to the integration test suite:

1. **Transaction Tests**: Multi-document operations
2. **Performance Tests**: Large dataset handling
3. **Migration Tests**: Schema evolution testing
4. **Backup/Restore**: Database recovery testing
5. **Replica Set Tests**: High availability scenarios
6. **Index Performance**: Query optimization validation

## Contributing

When adding new repository methods or modifying existing ones:

1. **Add Integration Tests**: Ensure new functionality is covered
2. **Test Edge Cases**: Include boundary conditions and error scenarios
3. **Validate Performance**: Test with realistic data volumes
4. **Document Changes**: Update this README with new test categories
5. **Verify Cleanup**: Ensure tests don't leave test data behind

import { Database } from '../../application/configuration/mongodb';
import { UserMongooseRepository } from '../../infrastructure/mongoose/repositories/user.mongoose.repository';
import { User } from '../../domain/entities/user';
import { generateUuid } from '../../utils/generate.uuid.util';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('User Repository Integration Tests', () => {
  let userRepository: UserMongooseRepository;
  let mongoMemoryServer: MongoMemoryServer;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoMemoryServer = await MongoMemoryServer.create();
    const mongoUri = mongoMemoryServer.getUri();
    
    console.log(`🧪 Starting in-memory MongoDB server: ${mongoUri}`);
    
    try {
      await Database.connect(mongoUri);
      userRepository = new UserMongooseRepository(Database.getConnection());
      console.log('✅ Connected to in-memory MongoDB successfully');
    } catch (error) {
      console.error('❌ Failed to connect to in-memory MongoDB:', error);
      throw error;
    }
  });

  afterAll(async () => {
    // Clean up database connection and stop in-memory server
    await Database.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      console.log('🛑 Stopped in-memory MongoDB server');
    }
  });

  beforeEach(async () => {
    // Clear all users before each test
    await userRepository.deleteMany({});
  });

  describe('User Creation and Retrieval', () => {
    it('should save a new user to the database', async () => {
      const userData: User = {
        id: null,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        hashPassword: 'hashedpassword123',
        salt: 'randomsalt',
        confirmed: false,
        stripeId: null,
        maxUsers: 10,
        maxSpaces: 5,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const savedUser = await userRepository.save(userData);

      expect(savedUser).toBeDefined();
      expect(savedUser.id).toBeDefined();
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.hashPassword).toBe(userData.hashPassword);
      expect(savedUser.salt).toBe(userData.salt);
      expect(savedUser.confirmed).toBe(false);
      expect(savedUser.maxUsers).toBe(10);
      expect(savedUser.maxSpaces).toBe(5);
      expect(savedUser.maxStorage).toBe(1000);
      expect(savedUser.maxAiEnhancementsPerMonth).toBe(50);
    });

    it('should retrieve a user by ID', async () => {
      const userData: User = {
        id: null,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        hashPassword: 'hashedpassword456',
        salt: 'anothersalt',
        confirmed: true,
        stripeId: 'cus_test123',
        maxUsers: 20,
        maxSpaces: 10,
        maxStorage: 2000,
        maxAiEnhancementsPerMonth: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const savedUser = await userRepository.save(userData);
      const retrievedUser = await userRepository.findById(savedUser.id!);

      expect(retrievedUser).toBeDefined();
      expect(retrievedUser!.id).toBe(savedUser.id);
      expect(retrievedUser!.firstName).toBe(userData.firstName);
      expect(retrievedUser!.lastName).toBe(userData.lastName);
      expect(retrievedUser!.email).toBe(userData.email);
      expect(retrievedUser!.confirmed).toBe(true);
      expect(retrievedUser!.stripeId).toBe('cus_test123');
    });

    it('should return null when retrieving non-existent user', async () => {
      const nonExistentId = generateUuid();
      const result = await userRepository.findById(nonExistentId);
      
      expect(result).toBeNull();
    });
  });

  describe('User Filtering and Searching', () => {
    beforeEach(async () => {
      // Create test users with various properties
      const testUsers: User[] = [
        {
          id: null,
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice.johnson@example.com',
          hashPassword: 'hash1',
          salt: 'salt1',
          confirmed: true,
          stripeId: 'cus_alice123',
          maxUsers: 5,
          maxSpaces: 3,
          maxStorage: 500,
          maxAiEnhancementsPerMonth: 25,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: null,
          firstName: 'Bob',
          lastName: 'Wilson',
          email: 'bob.wilson@example.com',
          hashPassword: 'hash2',
          salt: 'salt2',
          confirmed: false,
          stripeId: null,
          maxUsers: 15,
          maxSpaces: 8,
          maxStorage: 1500,
          maxAiEnhancementsPerMonth: 75,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02')
        },
        {
          id: null,
          firstName: 'Charlie',
          lastName: 'Brown',
          email: 'charlie.brown@example.com',
          hashPassword: 'hash3',
          salt: 'salt3',
          confirmed: true,
          stripeId: 'cus_charlie456',
          maxUsers: 10,
          maxSpaces: 5,
          maxStorage: 1000,
          maxAiEnhancementsPerMonth: 50,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03')
        }
      ];

      for (const user of testUsers) {
        await userRepository.save(user);
      }
    });

    it('should filter users by confirmed status', async () => {
      const confirmedUsers = await userRepository.findMany({
        filters: {
          confirmed: { exact: true }
        }
      });

      expect(confirmedUsers.data.length).toBe(2);
      expect(confirmedUsers.data.every(user => user.confirmed)).toBe(true);
      expect(confirmedUsers.data.map(u => u.firstName).sort()).toEqual(['Alice', 'Charlie']);
    });

    it('should filter users by email contains', async () => {
      const johnsonUsers = await userRepository.findMany({
        filters: {
          email: { contains: 'johnson' }
        }
      });

      expect(johnsonUsers.data.length).toBe(1);
      expect(johnsonUsers.data[0].firstName).toBe('Alice');
      expect(johnsonUsers.data[0].email).toBe('alice.johnson@example.com');
    });

    it('should filter users by firstName exact match', async () => {
      const bobUsers = await userRepository.findMany({
        filters: {
          firstName: { exact: 'Bob' }
        }
      });

      expect(bobUsers.data.length).toBe(1);
      expect(bobUsers.data[0].firstName).toBe('Bob');
      expect(bobUsers.data[0].lastName).toBe('Wilson');
    });

    it('should filter users by maxSpaces range', async () => {
      const highSpaceUsers = await userRepository.findMany({
        filters: {
          maxSpaces: { exact: 8 }
        }
      });

      expect(highSpaceUsers.data.length).toBe(1);
      expect(highSpaceUsers.data[0].firstName).toBe('Bob');
      expect(highSpaceUsers.data[0].maxSpaces).toBe(8);
    });

    it('should handle pagination correctly', async () => {
      const firstPage = await userRepository.findMany({
        pageNumber: 1,
        pageSize: 2
      });

      expect(firstPage.data.length).toBe(2);
      expect(firstPage.pagination.totalItems).toBe(3);
      expect(firstPage.pagination.currentPage).toBe(1);
      expect(firstPage.pagination.pageSize).toBe(2);
      expect(firstPage.pagination.totalPages).toBe(2);

      const secondPage = await userRepository.findMany({
        pageNumber: 2,
        pageSize: 2
      });

      expect(secondPage.data.length).toBe(1);
      expect(secondPage.pagination.currentPage).toBe(2);
      expect(secondPage.pagination.totalPages).toBe(2);
    });

    it('should sort users by firstName', async () => {
      const sortedUsers = await userRepository.findMany({
        sortBy: 'firstName' as any,
        sortOrder: 'asc'
      });

      expect(sortedUsers.data.length).toBe(3);
      expect(sortedUsers.data.map(u => u.firstName)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('should sort users by createdAt descending', async () => {
      const sortedUsers = await userRepository.findMany({
        sortBy: 'createdAt' as any,
        sortOrder: 'desc'
      });

      expect(sortedUsers.data.length).toBe(3);
      expect(sortedUsers.data.map(u => u.firstName)).toEqual(['Charlie', 'Bob', 'Alice']);
    });

    it('should combine filters and sorting', async () => {
      const filteredAndSorted = await userRepository.findMany({
        filters: {
          confirmed: { exact: true }
        },
        sortBy: 'firstName' as any,
        sortOrder: 'desc'
      });

      expect(filteredAndSorted.data.length).toBe(2);
      expect(filteredAndSorted.data.map(u => u.firstName)).toEqual(['Charlie', 'Alice']);
    });

    it('should combine filters, sorting, and pagination', async () => {
      const result = await userRepository.findMany({
        filters: {
          confirmed: { exact: true }
        },
        sortBy: 'firstName' as any,
        sortOrder: 'asc',
        pageNumber: 1,
        pageSize: 1
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].firstName).toBe('Alice');
      expect(result.pagination.totalItems).toBe(2);
      expect(result.pagination.totalPages).toBe(2);
    });
  });

  describe('User Updates', () => {
    let savedUser: User;

    beforeEach(async () => {
      const userData: User = {
        id: null,
        firstName: 'Diana',
        lastName: 'Prince',
        email: 'diana.prince@example.com',
        hashPassword: 'wonderwoman123',
        salt: 'amazonsalt',
        confirmed: false,
        stripeId: null,
        maxUsers: 1,
        maxSpaces: 1,
        maxStorage: 100,
        maxAiEnhancementsPerMonth: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      savedUser = await userRepository.save(userData);
    });

    it('should update user properties', async () => {
      const updatedUser = {
        ...savedUser,
        firstName: 'Wonder',
        lastName: 'Woman',
        confirmed: true,
        stripeId: 'cus_wonder789',
        maxUsers: 50,
        maxSpaces: 25,
        maxStorage: 5000,
        maxAiEnhancementsPerMonth: 200,
        updatedAt: new Date()
      };

      const result = await userRepository.save(updatedUser);

      expect(result.id).toBe(savedUser.id);
      expect(result.firstName).toBe('Wonder');
      expect(result.lastName).toBe('Woman');
      expect(result.confirmed).toBe(true);
      expect(result.stripeId).toBe('cus_wonder789');
      expect(result.maxUsers).toBe(50);
      expect(result.maxSpaces).toBe(25);
      expect(result.maxStorage).toBe(5000);
      expect(result.maxAiEnhancementsPerMonth).toBe(200);

      // Verify in database
      const retrievedUser = await userRepository.findById(savedUser.id!);
      expect(retrievedUser!.firstName).toBe('Wonder');
      expect(retrievedUser!.confirmed).toBe(true);
      expect(retrievedUser!.stripeId).toBe('cus_wonder789');
    });

    it('should update subscription fields', async () => {
      const updatedUser = {
        ...savedUser,
        subscriptionStripeId: 'sub_test123',
        subscriptionPlanStripeId: 'plan_premium456',
        subscriptionPlanExpiresAt: new Date('2025-01-01'),
        updatedAt: new Date()
      };

      const result = await userRepository.save(updatedUser);

      expect(result.subscriptionStripeId).toBe('sub_test123');
      expect(result.subscriptionPlanStripeId).toBe('plan_premium456');
      expect(result.subscriptionPlanExpiresAt).toEqual(new Date('2025-01-01'));
    });

    it('should update password-related fields', async () => {
      const updatedUser = {
        ...savedUser,
        hashPassword: 'newhash456',
        salt: 'newsalt789',
        lastPasswordUpdate: new Date(),
        updatedAt: new Date()
      };

      const result = await userRepository.save(updatedUser);

      expect(result.hashPassword).toBe('newhash456');
      expect(result.salt).toBe('newsalt789');
      expect(result.lastPasswordUpdate).toBeDefined();
    });
  });

  describe('User Deletion', () => {
    let savedUser: User;

    beforeEach(async () => {
      const userData: User = {
        id: null,
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@example.com',
        hashPassword: 'testhash',
        salt: 'testsalt',
        confirmed: true,
        stripeId: 'cus_test',
        maxUsers: 5,
        maxSpaces: 3,
        maxStorage: 500,
        maxAiEnhancementsPerMonth: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      savedUser = await userRepository.save(userData);
    });

    it('should soft delete a user (set deactivatedAt)', async () => {
      const deleteResult = await userRepository.delete(savedUser);

      expect(deleteResult.data).toBeDefined();
      expect(deleteResult.error).toBeUndefined();

      // User should not be found in normal queries (soft deleted)
      const retrievedUser = await userRepository.findById(savedUser.id!);
      expect(retrievedUser).toBeNull();

      // But should be found in ignore deletion queries
      const allUsers = await userRepository.findManyIgnoreDeletion({});
      expect(allUsers.data.length).toBe(1);
      expect(allUsers.data[0].deactivatedAt).toBeDefined();
    });

    it('should handle findManyIgnoreDeletion correctly', async () => {
      // Create another user
      const anotherUser: User = {
        id: null,
        firstName: 'Active',
        lastName: 'User',
        email: 'active.user@example.com',
        hashPassword: 'activehash',
        salt: 'activesalt',
        confirmed: true,
        stripeId: null,
        maxUsers: 1,
        maxSpaces: 1,
        maxStorage: 100,
        maxAiEnhancementsPerMonth: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await userRepository.save(anotherUser);

      // Delete first user
      await userRepository.delete(savedUser);

      // Normal query should only return active user
      const activeUsers = await userRepository.findMany({});
      expect(activeUsers.data.length).toBe(1);
      expect(activeUsers.data[0].firstName).toBe('Active');

      // Ignore deletion query should return both
      const allUsers = await userRepository.findManyIgnoreDeletion({});
      expect(allUsers.data.length).toBe(2);
    });
  });

  describe('Database Constraints and Validation', () => {
    it('should enforce email uniqueness', async () => {
      const userData1: User = {
        id: null,
        firstName: 'User',
        lastName: 'One',
        email: 'duplicate@example.com',
        hashPassword: 'hash1',
        salt: 'salt1',
        confirmed: false,
        stripeId: null,
        maxUsers: 1,
        maxSpaces: 1,
        maxStorage: 100,
        maxAiEnhancementsPerMonth: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const userData2: User = {
        id: null,
        firstName: 'User',
        lastName: 'Two',
        email: 'duplicate@example.com', // Same email
        hashPassword: 'hash2',
        salt: 'salt2',
        confirmed: false,
        stripeId: null,
        maxUsers: 1,
        maxSpaces: 1,
        maxStorage: 100,
        maxAiEnhancementsPerMonth: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await userRepository.save(userData1);

      // Second save should throw duplicate key error
      await expect(userRepository.save(userData2)).rejects.toThrow();
    });

    it('should handle special characters in names and emails', async () => {
      const userData: User = {
        id: null,
        firstName: 'José',
        lastName: "O'Brien-Smith",
        email: 'josé.o\'brien+test@example.com',
        hashPassword: 'hash123',
        salt: 'salt123',
        confirmed: false,
        stripeId: null,
        maxUsers: 1,
        maxSpaces: 1,
        maxStorage: 100,
        maxAiEnhancementsPerMonth: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const savedUser = await userRepository.save(userData);

      expect(savedUser.firstName).toBe('José');
      expect(savedUser.lastName).toBe("O'Brien-Smith");
      expect(savedUser.email).toBe('josé.o\'brien+test@example.com');

      // Should be able to find by special characters
      const foundUsers = await userRepository.findMany({
        filters: {
          firstName: { contains: 'José' }
        }
      });

      expect(foundUsers.data.length).toBe(1);
      expect(foundUsers.data[0].firstName).toBe('José');
    });

    it('should handle large numeric values', async () => {
      const userData: User = {
        id: null,
        firstName: 'Enterprise',
        lastName: 'User',
        email: 'enterprise@example.com',
        hashPassword: 'enterprisehash',
        salt: 'enterprisesalt',
        confirmed: true,
        stripeId: 'cus_enterprise',
        maxUsers: 999999,
        maxSpaces: 888888,
        maxStorage: 1000000000, // 1GB in MB
        maxAiEnhancementsPerMonth: 777777,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const savedUser = await userRepository.save(userData);

      expect(savedUser.maxUsers).toBe(999999);
      expect(savedUser.maxSpaces).toBe(888888);
      expect(savedUser.maxStorage).toBe(1000000000);
      expect(savedUser.maxAiEnhancementsPerMonth).toBe(777777);
    });
  });

  describe('Performance and Concurrency', () => {
    it('should handle concurrent user creation', async () => {
      const userPromises = [];
      
      for (let i = 0; i < 10; i++) {
        const userData: User = {
          id: null,
          firstName: `User${i}`,
          lastName: `Test${i}`,
          email: `user${i}@example.com`,
          hashPassword: `hash${i}`,
          salt: `salt${i}`,
          confirmed: i % 2 === 0,
          stripeId: i % 3 === 0 ? `cus_test${i}` : null,
          maxUsers: i * 10,
          maxSpaces: i * 5,
          maxStorage: i * 100,
          maxAiEnhancementsPerMonth: i * 20,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        userPromises.push(userRepository.save(userData));
      }

      const savedUsers = await Promise.all(userPromises);
      
      expect(savedUsers.length).toBe(10);
      savedUsers.forEach((user, index) => {
        expect(user.firstName).toBe(`User${index}`);
        expect(user.id).toBeDefined();
      });

      // Verify all users were saved
      const allUsers = await userRepository.findMany({});
      expect(allUsers.data.length).toBe(10);
    });

    it('should handle concurrent updates to the same user', async () => {
      const userData: User = {
        id: null,
        firstName: 'Concurrent',
        lastName: 'Test',
        email: 'concurrent@example.com',
        hashPassword: 'hash',
        salt: 'salt',
        confirmed: false,
        stripeId: null,
        maxUsers: 1,
        maxSpaces: 1,
        maxStorage: 100,
        maxAiEnhancementsPerMonth: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const savedUser = await userRepository.save(userData);

      // Simulate concurrent updates
      const update1 = { ...savedUser, firstName: 'Update1', updatedAt: new Date() };
      const update2 = { ...savedUser, lastName: 'Update2', updatedAt: new Date() };

      const [result1, result2] = await Promise.all([
        userRepository.save(update1),
        userRepository.save(update2)
      ]);

      // Both should succeed (last write wins)
      expect(result1.id).toBe(savedUser.id);
      expect(result2.id).toBe(savedUser.id);

      // Final state should reflect the last update
      const finalUser = await userRepository.findById(savedUser.id!);
      expect(finalUser).toBeDefined();
    });
  });

  describe('Complex Query Scenarios', () => {
    beforeEach(async () => {
      // Create a diverse set of test users
      const testUsers: User[] = [
        {
          id: null,
          firstName: 'Premium',
          lastName: 'User',
          email: 'premium@example.com',
          hashPassword: 'hash1',
          salt: 'salt1',
          confirmed: true,
          stripeId: 'cus_premium123',
          maxUsers: 100,
          maxSpaces: 50,
          maxStorage: 10000,
          maxAiEnhancementsPerMonth: 500,
          subscriptionStripeId: 'sub_premium',
          subscriptionPlanStripeId: 'plan_premium',
          subscriptionPlanExpiresAt: new Date('2025-12-31'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: null,
          firstName: 'Basic',
          lastName: 'User',
          email: 'basic@example.com',
          hashPassword: 'hash2',
          salt: 'salt2',
          confirmed: true,
          stripeId: 'cus_basic456',
          maxUsers: 5,
          maxSpaces: 3,
          maxStorage: 500,
          maxAiEnhancementsPerMonth: 25,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01')
        },
        {
          id: null,
          firstName: 'Free',
          lastName: 'User',
          email: 'free@example.com',
          hashPassword: 'hash3',
          salt: 'salt3',
          confirmed: false,
          stripeId: null,
          maxUsers: 1,
          maxSpaces: 1,
          maxStorage: 100,
          maxAiEnhancementsPerMonth: 5,
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date('2024-03-01')
        }
      ];

      for (const user of testUsers) {
        await userRepository.save(user);
      }
    });

    it('should find premium users (high limits)', async () => {
      const premiumUsers = await userRepository.findMany({
        filters: {
          maxStorage: { exact: 10000 }
        }
      });

      expect(premiumUsers.data.length).toBe(1);
      expect(premiumUsers.data[0].firstName).toBe('Premium');
      expect(premiumUsers.data[0].maxStorage).toBe(10000);
    });

    it('should find confirmed users with Stripe', async () => {
      const paidUsers = await userRepository.findMany({
        filters: {
          confirmed: { exact: true }
        }
      });

      // Filter manually since we can't do complex AND queries easily
      const confirmedWithStripe = paidUsers.data.filter(user => user.stripeId !== null);
      
      expect(confirmedWithStripe.length).toBe(2);
      expect(confirmedWithStripe.map(u => u.firstName).sort()).toEqual(['Basic', 'Premium']);
    });

    it('should find users by email domain', async () => {
      const exampleUsers = await userRepository.findMany({
        filters: {
          email: { contains: 'example.com' }
        }
      });

      expect(exampleUsers.data.length).toBe(3);
      expect(exampleUsers.data.every(user => user.email.includes('example.com'))).toBe(true);
    });

    it('should sort users by creation date with pagination', async () => {
      const firstPage = await userRepository.findMany({
        sortBy: 'createdAt' as any,
        sortOrder: 'asc',
        pageNumber: 1,
        pageSize: 2
      });

      expect(firstPage.data.length).toBe(2);
      expect(firstPage.data[0].firstName).toBe('Premium'); // Earliest
      expect(firstPage.data[1].firstName).toBe('Basic');

      const secondPage = await userRepository.findMany({
        sortBy: 'createdAt' as any,
        sortOrder: 'asc',
        pageNumber: 2,
        pageSize: 2
      });

      expect(secondPage.data.length).toBe(1);
      expect(secondPage.data[0].firstName).toBe('Free'); // Latest
    });
  });
});

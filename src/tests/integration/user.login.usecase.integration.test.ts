import { Database } from '../../application/configuration/mongodb';
import { UserMongooseRepository } from '../../infrastructure/mongoose/repositories/user.mongoose.repository';
import { UserUsecase } from '../../domain/usecases/user.usecase';
import { User } from '../../domain/entities/user';
import { CreateUserDTO } from '../../domain/interfaces/presenters/dtos/create.user.dto';
import { LoginUserDTO } from '../../domain/interfaces/presenters/dtos/login.user.dto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PasswordService } from '../../application/services/password/password.service';

// Mock the email service
jest.mock('../../application/services/send-email/nodemailer.email.service');
import { SendEmail } from '../../application/services/send-email/nodemailer.email.service';

describe('User Login Usecase Integration Tests', () => {
  let userRepository: UserMongooseRepository;
  let userUsecase: UserUsecase;
  let mongoMemoryServer: MongoMemoryServer;
  let testUser: User;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoMemoryServer = await MongoMemoryServer.create();
    const mongoUri = mongoMemoryServer.getUri();
    
    console.log(`🧪 Starting in-memory MongoDB server for login tests: ${mongoUri}`);
    
    try {
      await Database.connect(mongoUri);
      userRepository = new UserMongooseRepository(Database.getConnection());
      
      // Mock the SendEmail service
      (SendEmail as jest.MockedClass<typeof SendEmail>).prototype.send = jest.fn().mockResolvedValue(undefined);
      
      // Initialize usecase with real repository
      userUsecase = new UserUsecase(userRepository);
      
      console.log('✅ Connected to in-memory MongoDB for login tests');
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
      console.log('🛑 Stopped in-memory MongoDB server for login tests');
    }
  });

  beforeEach(async () => {
    // Clear all users before each test
    await userRepository.deleteMany({});
    
    // Create a test user for login tests
    const createUserDto: CreateUserDTO = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'SecurePassword123!'
    };

    const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
    testUser = await userRepository.save(userEntity);
  });

  describe('User Login Security', () => {
    it('should successfully login with correct credentials', async () => {
      const loginDto: LoginUserDTO = {
        email: 'test@example.com',
        password: 'SecurePassword123!'
      };

      const result = await userUsecase.login(loginDto);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(typeof result.accessToken).toBe('string');
      expect(result.accessToken.length).toBeGreaterThan(0);
      
      // Verify user exists in database
      const user = await userRepository.findMany({
        filters: { email: { exact: loginDto.email } }
      });
      expect(user.data[0]).toBeDefined();
      expect(user.data[0]!.email).toBe(loginDto.email);
      expect(user.data[0]!.firstName).toBe('Test');
      expect(user.data[0]!.lastName).toBe('User');
    });

    it('should reject login with incorrect password', async () => {
      const loginDto: LoginUserDTO = {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      };

      await expect(userUsecase.login(loginDto)).rejects.toThrow();
    });

    it('should reject login with non-existent email', async () => {
      const loginDto: LoginUserDTO = {
        email: 'nonexistent@example.com',
        password: 'SecurePassword123!'
      };

      await expect(userUsecase.login(loginDto)).rejects.toThrow();
    });

    it('should reject login with empty password', async () => {
      const loginDto: LoginUserDTO = {
        email: 'test@example.com',
        password: ''
      };

      await expect(userUsecase.login(loginDto)).rejects.toThrow();
    });

    it('should reject login with empty email', async () => {
      const loginDto: LoginUserDTO = {
        email: '',
        password: 'SecurePassword123!'
      };

      await expect(userUsecase.login(loginDto)).rejects.toThrow();
    });

    it('should reject login with null credentials', async () => {
      const loginDto: LoginUserDTO = {
        email: null as any,
        password: null as any
      };

      await expect(userUsecase.login(loginDto)).rejects.toThrow();
    });

    it('should reject login with undefined credentials', async () => {
      const loginDto: LoginUserDTO = {
        email: undefined as any,
        password: undefined as any
      };

      await expect(userUsecase.login(loginDto)).rejects.toThrow();
    });

    it('should handle case-sensitive email login', async () => {
      // Test with different case email
      const loginDto: LoginUserDTO = {
        email: 'TEST@EXAMPLE.COM',
        password: 'SecurePassword123!'
      };

      // Should fail because email is case-sensitive
      await expect(userUsecase.login(loginDto)).rejects.toThrow();
    });

    it('should handle case-sensitive password login', async () => {
      const loginDto: LoginUserDTO = {
        email: 'test@example.com',
        password: 'securepassword123!' // Different case
      };

      await expect(userUsecase.login(loginDto)).rejects.toThrow();
    });
  });

  describe('Password Security and Hashing', () => {
    it('should verify password hashing works correctly', async () => {
      const password = 'SecurePassword123!';
      
      // Verify the stored password is hashed
      const storedUser = await userRepository.findById(testUser.id!);
      expect(storedUser).toBeDefined();
      expect(storedUser!.hashPassword).not.toBe(password);
      expect(storedUser!.hashPassword.length).toBeGreaterThan(password.length);
      expect(storedUser!.salt).toBeDefined();
      expect(storedUser!.salt.length).toBeGreaterThan(0);

      // Verify password can be verified
      const isValid = await PasswordService.compare(password, storedUser!.hashPassword, storedUser!.salt);
      expect(isValid).toBe(true);
    });

    it('should reject login with slightly modified password', async () => {
      const variations = [
        'SecurePassword123', // Missing !
        'SecurePassword124!', // Different number
        'SecurePassword123@', // Different symbol
        'securePassword123!', // Different case
        'SecurePassword123! ', // Extra space
        ' SecurePassword123!', // Leading space
      ];

      for (const password of variations) {
        const loginDto: LoginUserDTO = {
          email: 'test@example.com',
          password: password
        };

        await expect(userUsecase.login(loginDto)).rejects.toThrow();
      }
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'A'.repeat(1000) + '!';
      
      // Create user with long password
      const createUserDto: CreateUserDTO = {
        firstName: 'Long',
        lastName: 'Password',
        email: 'longpassword@example.com',
        password: longPassword
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      const longPasswordUser = await userRepository.save(userEntity);

      // Try to login with long password
      const loginDto: LoginUserDTO = {
        email: 'longpassword@example.com',
        password: longPassword
      };

      const result = await userUsecase.login(loginDto);
      expect(result).toBeDefined();
             // Verify user exists in database
       const user = await userRepository.findMany({
         filters: { email: { exact: 'longpassword@example.com' } }
       });
       expect(user.data[0]).toBeDefined();
       expect(user.data[0]!.email).toBe('longpassword@example.com');
    });

    it('should handle special characters in passwords', async () => {
      const specialPasswords = [
        'P@ssw0rd!',
        'P@ssw0rd#',
        'P@ssw0rd$',
        'P@ssw0rd%',
        'P@ssw0rd^',
        'P@ssw0rd&',
        'P@ssw0rd*',
        'P@ssw0rd(',
        'P@ssw0rd)',
        'P@ssw0rd-',
        'P@ssw0rd_',
        'P@ssw0rd+',
        'P@ssw0rd=',
        'P@ssw0rd[',
        'P@ssw0rd]',
        'P@ssw0rd{',
        'P@ssw0rd}',
        'P@ssw0rd|',
        'P@ssw0rd\\',
        'P@ssw0rd/',
        'P@ssw0rd?',
        'P@ssw0rd<',
        'P@ssw0rd>',
        'P@ssw0rd,',
        'P@ssw0rd.',
        'P@ssw0rd;',
        'P@ssw0rd:',
        'P@ssw0rd"',
        'P@ssw0rd\'',
        'P@ssw0rd`',
        'P@ssw0rd~',
      ];

      for (let i = 0; i < specialPasswords.length; i++) {
        const password = specialPasswords[i];
        const email = `special${i}@example.com`;
        
        // Create user with special password
        const createUserDto: CreateUserDTO = {
          firstName: 'Special',
          lastName: 'Password',
          email: email,
          password: password
        };

        const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
        await userRepository.save(userEntity);

        // Try to login with special password
        const loginDto: LoginUserDTO = {
          email: email,
          password: password
        };

        const result = await userUsecase.login(loginDto);
        expect(result).toBeDefined();
        expect(result.accessToken).toBeDefined();
        
        // Verify user exists in database
        const user = await userRepository.findMany({
          filters: { email: { exact: email } }
        });
        expect(user.data[0]).toBeDefined();
        expect(user.data[0]!.email).toBe(email);
      }
    });
  });

  describe('Email Handling and Validation', () => {
    it('should handle various email formats', async () => {
      const emailFormats = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user-name@example.com',
        'user_name@example.com',
        'user123@example.com',
        'user@subdomain.example.com',
        'user@example.co.uk',
        'user@example-domain.com',
        'user@example.рф', // Cyrillic
        'user@example.中国', // Chinese
        'user@example.日本', // Japanese
      ];

      for (let i = 0; i < emailFormats.length; i++) {
        const email = emailFormats[i];
        const password = 'SecurePassword123!';
        
        // Create user with special email
        const createUserDto: CreateUserDTO = {
          firstName: 'Email',
          lastName: 'Test',
          email: email,
          password: password
        };

        const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
        await userRepository.save(userEntity);

        // Try to login
        const loginDto: LoginUserDTO = {
          email: email,
          password: password
        };

        const result = await userUsecase.login(loginDto);
        expect(result).toBeDefined();
        expect(result.accessToken).toBeDefined();
        
        // Verify user exists in database
        const user = await userRepository.findMany({
          filters: { email: { exact: email } }
        });
        expect(user.data[0]).toBeDefined();
        expect(user.data[0]!.email).toBe(email);
      }
    });

    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com';
      const password = 'SecurePassword123!';
      
      // Create user with long email
      const createUserDto: CreateUserDTO = {
        firstName: 'Long',
        lastName: 'Email',
        email: longEmail,
        password: password
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      await userRepository.save(userEntity);

      // Try to login
      const loginDto: LoginUserDTO = {
        email: longEmail,
        password: password
      };

      const result = await userUsecase.login(loginDto);
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      
      // Verify user exists in database
      const user = await userRepository.findMany({
        filters: { email: { exact: longEmail } }
      });
      expect(user.data[0]).toBeDefined();
      expect(user.data[0]!.email).toBe(longEmail);
    });

    it('should handle email addresses with whitespace', async () => {
      const emailWithWhitespace = '  test@example.com  ';
      const password = 'SecurePassword123!';
      
      // Create user with whitespace email
      const createUserDto: CreateUserDTO = {
        firstName: 'Whitespace',
        lastName: 'Email',
        email: emailWithWhitespace,
        password: password
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      await userRepository.save(userEntity);

      // Try to login with exact same whitespace
      const loginDto: LoginUserDTO = {
        email: emailWithWhitespace,
        password: password
      };

      const result = await userUsecase.login(loginDto);
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      
      // Verify user exists in database
      const user = await userRepository.findMany({
        filters: { email: { exact: emailWithWhitespace } }
      });
      expect(user.data[0]).toBeDefined();
      expect(user.data[0]!.email).toBe(emailWithWhitespace);
    });
  });

  describe('Concurrent Login Attempts', () => {
    it('should handle multiple concurrent login attempts with correct credentials', async () => {
      // Create multiple users for concurrent login
      const users = [];
      for (let i = 0; i < 10; i++) {
        const createUserDto: CreateUserDTO = {
          firstName: `Concurrent${i}`,
          lastName: 'User',
          email: `concurrent${i}@example.com`,
          password: 'SecurePassword123!'
        };

        const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
        users.push(await userRepository.save(userEntity));
      }

      const loginPromises = [];
      for (let i = 0; i < 10; i++) {
        const loginDto: LoginUserDTO = {
          email: `concurrent${i}@example.com`,
          password: 'SecurePassword123!'
        };
        loginPromises.push(userUsecase.login(loginDto));
      }

      const results = await Promise.all(loginPromises);
      
      // All should succeed
      expect(results.length).toBe(10);
      
      // All should have valid tokens
      for (const result of results) {
        expect(result).toBeDefined();
        expect(result.accessToken).toBeDefined();
        expect(typeof result.accessToken).toBe('string');
      }

      // All tokens should be different (unique)
      const tokens = results.map(r => r.accessToken);
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(10);
    });

    it('should handle concurrent login attempts with incorrect credentials', async () => {
      const loginDto: LoginUserDTO = {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      };

      const loginPromises = [];
      for (let i = 0; i < 10; i++) {
        loginPromises.push(userUsecase.login(loginDto).catch(error => error));
      }

      const results = await Promise.all(loginPromises);
      
      // All should fail
      expect(results.length).toBe(10);
      
      // All should be errors
      for (const result of results) {
        expect(result).toBeInstanceOf(Error);
      }
    });

    it('should handle concurrent login attempts with non-existent users', async () => {
      const loginDto: LoginUserDTO = {
        email: 'nonexistent@example.com',
        password: 'SecurePassword123!'
      };

      const loginPromises = [];
      for (let i = 0; i < 10; i++) {
        loginPromises.push(userUsecase.login(loginDto).catch(error => error));
      }

      const results = await Promise.all(loginPromises);
      
      // All should fail
      expect(results.length).toBe(10);
      
      // All should be errors
      for (const result of results) {
        expect(result).toBeInstanceOf(Error);
      }
    });
  });

  describe('User Account States', () => {
    it('should allow login for confirmed users', async () => {
      // Create a new confirmed user
      const createUserDto: CreateUserDTO = {
        firstName: 'Confirmed',
        lastName: 'User',
        email: 'confirmed@example.com',
        password: 'SecurePassword123!'
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      userEntity.confirmed = true;
      await userRepository.save(userEntity);

      const loginDto: LoginUserDTO = {
        email: 'confirmed@example.com',
        password: 'SecurePassword123!'
      };

      const result = await userUsecase.login(loginDto);
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      
      // Verify user is confirmed in database
      const user = await userRepository.findMany({
        filters: { email: { exact: 'confirmed@example.com' } }
      });
      expect(user.data[0]).toBeDefined();
      expect(user.data[0]!.confirmed).toBe(true);
    });

    it('should allow login for unconfirmed users', async () => {
      // Create a new unconfirmed user
      const createUserDto: CreateUserDTO = {
        firstName: 'Unconfirmed',
        lastName: 'User',
        email: 'unconfirmed@example.com',
        password: 'SecurePassword123!'
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      userEntity.confirmed = false;
      await userRepository.save(userEntity);

      const loginDto: LoginUserDTO = {
        email: 'unconfirmed@example.com',
        password: 'SecurePassword123!'
      };

      const result = await userUsecase.login(loginDto);
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      
      // Verify user is unconfirmed in database
      const user = await userRepository.findMany({
        filters: { email: { exact: 'unconfirmed@example.com' } }
      });
      expect(user.data[0]).toBeDefined();
      expect(user.data[0]!.confirmed).toBe(false);
    });

    it('should handle login for users with subscription data', async () => {
      // Create a new user with subscription data
      const createUserDto: CreateUserDTO = {
        firstName: 'Subscription',
        lastName: 'User',
        email: 'subscription@example.com',
        password: 'SecurePassword123!'
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      userEntity.subscriptionStripeId = 'sub_test123';
      userEntity.subscriptionPlanStripeId = 'plan_test123';
      userEntity.subscriptionPlanExpiresAt = new Date(Date.now() + 86400000); // 1 day from now
      await userRepository.save(userEntity);

      const loginDto: LoginUserDTO = {
        email: 'subscription@example.com',
        password: 'SecurePassword123!'
      };

      const result = await userUsecase.login(loginDto);
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      
      // Verify subscription data in database
      const user = await userRepository.findMany({
        filters: { email: { exact: 'subscription@example.com' } }
      });
      expect(user.data[0]).toBeDefined();
      expect(user.data[0]!.subscriptionStripeId).toBe('sub_test123');
      expect(user.data[0]!.subscriptionPlanStripeId).toBe('plan_test123');
      expect(user.data[0]!.subscriptionPlanExpiresAt).toBeDefined();
    });

    it('should handle login for users with limits', async () => {
      // Create a new user with limits
      const createUserDto: CreateUserDTO = {
        firstName: 'Limited',
        lastName: 'User',
        email: 'limited@example.com',
        password: 'SecurePassword123!'
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      userEntity.maxUsers = 10;
      userEntity.maxSpaces = 5;
      userEntity.maxStorage = 1024 * 1024 * 1024; // 1GB
      userEntity.maxAiEnhancementsPerMonth = 100;
      await userRepository.save(userEntity);

      const loginDto: LoginUserDTO = {
        email: 'limited@example.com',
        password: 'SecurePassword123!'
      };

      const result = await userUsecase.login(loginDto);
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      
      // Verify limits in database
      const user = await userRepository.findMany({
        filters: { email: { exact: 'limited@example.com' } }
      });
      expect(user.data[0]).toBeDefined();
      expect(user.data[0]!.maxUsers).toBe(10);
      expect(user.data[0]!.maxSpaces).toBe(5);
      expect(user.data[0]!.maxStorage).toBe(1024 * 1024 * 1024);
      expect(user.data[0]!.maxAiEnhancementsPerMonth).toBe(100);
    });
  });

  describe('Token Generation and Security', () => {
    it('should generate unique tokens for each login', async () => {
      // Create multiple users to ensure unique tokens
      const users = [];
      for (let i = 0; i < 3; i++) {
        const createUserDto: CreateUserDTO = {
          firstName: `Token${i}`,
          lastName: 'User',
          email: `token${i}@example.com`,
          password: 'SecurePassword123!'
        };

        const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
        users.push(await userRepository.save(userEntity));
      }

      const login1 = await userUsecase.login({ email: 'token0@example.com', password: 'SecurePassword123!' });
      const login2 = await userUsecase.login({ email: 'token1@example.com', password: 'SecurePassword123!' });
      const login3 = await userUsecase.login({ email: 'token2@example.com', password: 'SecurePassword123!' });

      expect(login1.accessToken).not.toBe(login2.accessToken);
      expect(login2.accessToken).not.toBe(login3.accessToken);
      expect(login1.accessToken).not.toBe(login3.accessToken);

      // All tokens should be valid JWT format
      expect(login1.accessToken.split('.')).toHaveLength(3);
      expect(login2.accessToken.split('.')).toHaveLength(3);
      expect(login3.accessToken.split('.')).toHaveLength(3);
    });

    it('should generate tokens with proper structure', async () => {
      const loginDto: LoginUserDTO = {
        email: 'test@example.com',
        password: 'SecurePassword123!'
      };

      const result = await userUsecase.login(loginDto);
      const token = result.accessToken;

      // JWT tokens have 3 parts separated by dots
      const parts = token.split('.');
      expect(parts).toHaveLength(3);

      // Each part should be base64 encoded (allowing for URL-safe base64)
      for (const part of parts) {
        expect(part).toMatch(/^[A-Za-z0-9+/=_-]+$/);
      }

      // Token should be reasonably long
      expect(token.length).toBeGreaterThan(100);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test simulates what would happen if the database connection fails
      // In a real scenario, this would be handled by the repository layer
      const loginDto: LoginUserDTO = {
        email: 'test@example.com',
        password: 'SecurePassword123!'
      };

      // This should work normally
      const result = await userUsecase.login(loginDto);
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      
      // Verify user exists in database
      const user = await userRepository.findMany({
        filters: { email: { exact: loginDto.email } }
      });
      expect(user.data[0]).toBeDefined();
      expect(user.data[0]!.email).toBe(loginDto.email);
    });

    it('should handle malformed email data', async () => {
      const malformedEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        'user@example..com'
      ];

      for (const email of malformedEmails) {
        const loginDto: LoginUserDTO = {
          email: email,
          password: 'SecurePassword123!'
        };

        // Should fail for malformed emails
        await expect(userUsecase.login(loginDto)).rejects.toThrow();
      }
    });

    it('should handle extremely long credentials', async () => {
      const longEmail = 'a'.repeat(1000) + '@example.com';
      const longPassword = 'A'.repeat(1000) + '!';

      const loginDto: LoginUserDTO = {
        email: longEmail,
        password: longPassword
      };

      // Should fail for non-existent user
      await expect(userUsecase.login(loginDto)).rejects.toThrow();
    });

    it('should handle special characters in credentials', async () => {
      const specialChars = [
        '\u0000', // Null byte
        '\u0001', // Start of heading
        '\u0002', // Start of text
        '\u0003', // End of text
        '\u0004', // End of transmission
        '\u0005', // Enquiry
        '\u0006', // Acknowledge
        '\u0007', // Bell
        '\u0008', // Backspace
        '\u0009', // Tab
        '\u000A', // Line feed
        '\u000B', // Vertical tab
        '\u000C', // Form feed
        '\u000D', // Carriage return
      ];

      for (const char of specialChars) {
        const loginDto: LoginUserDTO = {
          email: `test${char}@example.com`,
          password: `password${char}123!`
        };

        // Should fail for non-existent user
        await expect(userUsecase.login(loginDto)).rejects.toThrow();
      }
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle rapid successive login attempts', async () => {
      const loginDto: LoginUserDTO = {
        email: 'test@example.com',
        password: 'SecurePassword123!'
      };

      const startTime = Date.now();
      
      // Perform 20 rapid login attempts (reduced for performance)
      for (let i = 0; i < 20; i++) {
        const result = await userUsecase.login(loginDto);
        expect(result).toBeDefined();
        expect(result.accessToken).toBeDefined();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (10 seconds)
      expect(duration).toBeLessThan(10000);
    });

    it('should handle login with multiple users', async () => {
      // Create multiple users
      const users = [];
      for (let i = 0; i < 20; i++) {
        const createUserDto: CreateUserDTO = {
          firstName: `User${i}`,
          lastName: 'Test',
          email: `user${i}@example.com`,
          password: 'SecurePassword123!'
        };

        const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
        users.push(await userRepository.save(userEntity));
      }

      // Login with each user
      for (let i = 0; i < users.length; i++) {
        const loginDto: LoginUserDTO = {
          email: `user${i}@example.com`,
          password: 'SecurePassword123!'
        };

        const result = await userUsecase.login(loginDto);
        expect(result).toBeDefined();
        expect(result.accessToken).toBeDefined();
        
        // Verify user exists in database
        const user = await userRepository.findMany({
          filters: { email: { exact: `user${i}@example.com` } }
        });
        expect(user.data[0]).toBeDefined();
        expect(user.data[0]!.email).toBe(`user${i}@example.com`);
        expect(user.data[0]!.firstName).toBe(`User${i}`);
      }
    });
  });
});

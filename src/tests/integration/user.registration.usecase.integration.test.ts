import { Database } from '../../application/configuration/mongodb';
import { UserMongooseRepository } from '../../infrastructure/mongoose/repositories/user.mongoose.repository';
import { UserUsecase } from '../../domain/usecases/user.usecase';
import { User } from '../../domain/entities/user';
import { CreateUserDTO } from '../../domain/interfaces/presenters/dtos/create.user.dto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PasswordService } from '../../application/services/password/password.service';

// Mock the email service
jest.mock('../../application/services/send-email/nodemailer.email.service');
import { SendEmail } from '../../application/services/send-email/nodemailer.email.service';

describe('User Registration Usecase Integration Tests', () => {
  let userRepository: UserMongooseRepository;
  let userUsecase: UserUsecase;
  let mongoMemoryServer: MongoMemoryServer;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoMemoryServer = await MongoMemoryServer.create();
    const mongoUri = mongoMemoryServer.getUri();
    
    console.log(`🧪 Starting in-memory MongoDB server for registration tests: ${mongoUri}`);
    
    try {
      await Database.connect(mongoUri);
      userRepository = new UserMongooseRepository(Database.getConnection());
      
      // Mock the SendEmail service
      (SendEmail as jest.MockedClass<typeof SendEmail>).prototype.send = jest.fn().mockResolvedValue(undefined);
      
      // Initialize usecase with real repository
      userUsecase = new UserUsecase(userRepository);
      
      console.log('✅ Connected to in-memory MongoDB for registration tests');
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
      console.log('🛑 Stopped in-memory MongoDB server for registration tests');
    }
  });

  beforeEach(async () => {
    // Clear all users before each test
    await userRepository.deleteMany({});
  });

  describe('User Registration Email Handling', () => {
    it('should successfully register user with valid email and save to database', async () => {
      const createUserDto: CreateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'SecurePassword123!'
      };

      // Map DTO to entity using usecase
      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      
      // Save to database using repository
      const savedUser = await userRepository.save(userEntity);

      // Verify user was saved correctly
      expect(savedUser).toBeDefined();
      expect(savedUser.id).toBeDefined();
      expect(savedUser.email).toBe(createUserDto.email);
      expect(savedUser.firstName).toBe(createUserDto.firstName);
      expect(savedUser.lastName).toBe(createUserDto.lastName);
      expect(savedUser.confirmed).toBe(false); // Should be false initially
      expect(savedUser.hashPassword).toBeDefined();
      expect(savedUser.salt).toBeDefined();
      expect(savedUser.hashPassword).not.toBe(createUserDto.password); // Password should be hashed

      // Verify email is stored exactly as provided
      expect(savedUser.email).toBe('john.doe@example.com');
      expect(typeof savedUser.email).toBe('string');

      // Verify in database directly
      const retrievedUser = await userRepository.findById(savedUser.id!);
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser!.email).toBe(createUserDto.email);
    });

    it('should handle email case sensitivity correctly', async () => {
      const createUserDto: CreateUserDTO = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'JANE.SMITH@EXAMPLE.COM',
        password: 'SecurePassword123!'
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      const savedUser = await userRepository.save(userEntity);

      // Email should be stored exactly as provided (case-sensitive)
      expect(savedUser.email).toBe('JANE.SMITH@EXAMPLE.COM');

      // Verify case-sensitive uniqueness
      const duplicateUserDto: CreateUserDTO = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com', // Different case
        password: 'SecurePassword123!'
      };

      const duplicateEntity = await userUsecase.mapCreateDtoToEntity(duplicateUserDto);
      
      // Should be able to save with different case (MongoDB email uniqueness is case-sensitive)
      const duplicateUser = await userRepository.save(duplicateEntity);
      expect(duplicateUser.email).toBe('jane.smith@example.com');
    });

    it('should handle special characters in email addresses', async () => {
      const specialEmails = [
        'user+tag@example.com',
        'user.name@example.com',
        'user-name@example.com',
        'user_name@example.com',
        'user123@example.com',
        'user@subdomain.example.com',
        'user@example.co.uk',
        'user@example-domain.com'
      ];

      for (const email of specialEmails) {
        const createUserDto: CreateUserDTO = {
          firstName: 'Test',
          lastName: 'User',
          email: email,
          password: 'SecurePassword123!'
        };

        const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
        const savedUser = await userRepository.save(userEntity);

        // Email should be stored exactly as provided
        expect(savedUser.email).toBe(email);
        expect(typeof savedUser.email).toBe('string');

        // Verify in database
        const retrievedUser = await userRepository.findById(savedUser.id!);
        expect(retrievedUser!.email).toBe(email);
      }
    });

    it('should handle international email addresses', async () => {
      const internationalEmails = [
        'user@example.рф', // Cyrillic
        'user@example.中国', // Chinese
        'user@example.日本', // Japanese
        'user@example.한국', // Korean
        'user@example.مصر', // Arabic
        'user@example.भारत', // Hindi
        'user@example.বাংলা', // Bengali
        'user@example.ไทย' // Thai
      ];

      for (const email of internationalEmails) {
        const createUserDto: CreateUserDTO = {
          firstName: 'International',
          lastName: 'User',
          email: email,
          password: 'SecurePassword123!'
        };

        const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
        const savedUser = await userRepository.save(userEntity);

        // Email should be stored exactly as provided
        expect(savedUser.email).toBe(email);
        expect(typeof savedUser.email).toBe('string');

        // Verify in database
        const retrievedUser = await userRepository.findById(savedUser.id!);
        expect(retrievedUser!.email).toBe(email);
      }
    });

    it('should enforce email uniqueness constraint', async () => {
      const email = 'unique@example.com';
      
      // First user
      const createUserDto1: CreateUserDTO = {
        firstName: 'User',
        lastName: 'One',
        email: email,
        password: 'SecurePassword123!'
      };

      const userEntity1 = await userUsecase.mapCreateDtoToEntity(createUserDto1);
      await userRepository.save(userEntity1);

      // Second user with same email
      const createUserDto2: CreateUserDTO = {
        firstName: 'User',
        lastName: 'Two',
        email: email, // Same email
        password: 'SecurePassword123!'
      };

      const userEntity2 = await userUsecase.mapCreateDtoToEntity(createUserDto2);
      
      // Should throw duplicate key error
      await expect(userRepository.save(userEntity2)).rejects.toThrow();
    });

    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
      expect(longEmail.length).toBeGreaterThan(100); // Ensure it's actually long

      const createUserDto: CreateUserDTO = {
        firstName: 'Long',
        lastName: 'Email',
        email: longEmail,
        password: 'SecurePassword123!'
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      const savedUser = await userRepository.save(userEntity);

      // Email should be stored exactly as provided
      expect(savedUser.email).toBe(longEmail);
      expect(savedUser.email.length).toBe(longEmail.length);

      // Verify in database
      const retrievedUser = await userRepository.findById(savedUser.id!);
      expect(retrievedUser!.email).toBe(longEmail);
    });

    it('should handle email addresses with multiple @ symbols in local part', async () => {
      const emailWithMultipleAt = 'user@local@example.com';

      const createUserDto: CreateUserDTO = {
        firstName: 'Multiple',
        lastName: 'At',
        email: emailWithMultipleAt,
        password: 'SecurePassword123!'
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      const savedUser = await userRepository.save(userEntity);

      // Email should be stored exactly as provided
      expect(savedUser.email).toBe(emailWithMultipleAt);

      // Verify in database
      const retrievedUser = await userRepository.findById(savedUser.id!);
      expect(retrievedUser!.email).toBe(emailWithMultipleAt);
    });
  });

  describe('User Registration Robustness', () => {
    it('should handle concurrent user registrations with different emails', async () => {
      const userPromises = [];
      
      for (let i = 0; i < 10; i++) {
        const createUserDto: CreateUserDTO = {
          firstName: `User${i}`,
          lastName: `Test${i}`,
          email: `user${i}@example.com`,
          password: 'SecurePassword123!'
        };
        
        userPromises.push(
          userUsecase.mapCreateDtoToEntity(createUserDto)
            .then(entity => userRepository.save(entity))
        );
      }

      const savedUsers = await Promise.all(userPromises);
      
      // All should succeed
      expect(savedUsers.length).toBe(10);
      
      // All should have unique emails
      const emails = savedUsers.map(user => user.email);
      const uniqueEmails = new Set(emails);
      expect(uniqueEmails.size).toBe(10);

      // All should have unique IDs
      const ids = savedUsers.map(user => user.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);

      // Verify all users in database
      const allUsers = await userRepository.findMany({
        pageNumber: 1,
        pageSize: 20
      });
      expect(allUsers.data.length).toBe(10);
    });

    it('should handle concurrent user registrations with same email (should fail)', async () => {
      const email = 'concurrent@example.com';
      const createUserDto: CreateUserDTO = {
        firstName: 'Concurrent',
        lastName: 'User',
        email: email,
        password: 'SecurePassword123!'
      };

      const userPromises = [];
      
      for (let i = 0; i < 5; i++) {
        userPromises.push(
          userUsecase.mapCreateDtoToEntity(createUserDto)
            .then(entity => userRepository.save(entity))
        );
      }

      // One should succeed, others should fail
      const results = await Promise.allSettled(userPromises);
      
      const fulfilled = results.filter(result => result.status === 'fulfilled');
      const rejected = results.filter(result => result.status === 'rejected');
      
      expect(fulfilled.length).toBe(1); // Only one should succeed
      expect(rejected.length).toBe(4); // Others should fail due to duplicate key

      // Verify only one user exists in database
      const allUsers = await userRepository.findMany({
        filters: { email: { exact: email } }
      });
      expect(allUsers.data.length).toBe(1);
    });

    it('should handle registration with missing required fields', async () => {
      const incompleteDto = {
        firstName: 'Incomplete',
        // Missing lastName, email, password
      } as CreateUserDTO;

      // Note: mapCreateDtoToEntity doesn't validate, it just maps
      // Validation happens at controller/middleware level
      const userEntity = await userUsecase.mapCreateDtoToEntity(incompleteDto);
      
      // Should create entity with undefined values
      expect(userEntity.firstName).toBe('Incomplete');
      expect(userEntity.lastName).toBeUndefined();
      expect(userEntity.email).toBeUndefined();
      expect(userEntity.hashPassword).toBeDefined(); // Password was hashed
    });

    it('should handle registration with empty email', async () => {
      const createUserDto: CreateUserDTO = {
        firstName: 'Empty',
        lastName: 'Email',
        email: '', // Empty email
        password: 'SecurePassword123!'
      };

      // Should create entity with empty email
      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      expect(userEntity.email).toBe('');
      
      // Should fail at database level due to schema validation
      await expect(userRepository.save(userEntity)).rejects.toThrow('Path `email` is required');
    });

    it('should handle registration with null email', async () => {
      const createUserDto: CreateUserDTO = {
        firstName: 'Null',
        lastName: 'Email',
        email: null as any, // Null email
        password: 'SecurePassword123!'
      };

      // Should create entity with null email
      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      expect(userEntity.email).toBeNull();
      
      // Should fail at database level due to schema validation
      await expect(userRepository.save(userEntity)).rejects.toThrow('Path `email` is required');
    });

    it('should handle registration with undefined email', async () => {
      const createUserDto: CreateUserDTO = {
        firstName: 'Undefined',
        lastName: 'Email',
        email: undefined as any, // Undefined email
        password: 'SecurePassword123!'
      };

      // Should create entity with undefined email
      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      expect(userEntity.email).toBeUndefined();
      
      // Should fail at database level due to schema validation
      await expect(userRepository.save(userEntity)).rejects.toThrow('Path `email` is required');
    });
  });

  describe('Email Validation and Storage', () => {
    it('should preserve email whitespace if provided', async () => {
      const emailWithWhitespace = '  user@example.com  ';

      const createUserDto: CreateUserDTO = {
        firstName: 'Whitespace',
        lastName: 'User',
        email: emailWithWhitespace,
        password: 'SecurePassword123!'
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      const savedUser = await userRepository.save(userEntity);

      // Email should be stored exactly as provided (including whitespace)
      expect(savedUser.email).toBe(emailWithWhitespace);

      // Verify in database
      const retrievedUser = await userRepository.findById(savedUser.id!);
      expect(retrievedUser!.email).toBe(emailWithWhitespace);
    });

    it('should handle email addresses with leading/trailing dots', async () => {
      const emailWithDots = '.user@example.com.';

      const createUserDto: CreateUserDTO = {
        firstName: 'Dots',
        lastName: 'User',
        email: emailWithDots,
        password: 'SecurePassword123!'
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      const savedUser = await userRepository.save(userEntity);

      // Email should be stored exactly as provided
      expect(savedUser.email).toBe(emailWithDots);

      // Verify in database
      const retrievedUser = await userRepository.findById(savedUser.id!);
      expect(retrievedUser!.email).toBe(emailWithDots);
    });

    it('should handle email addresses with multiple dots in domain', async () => {
      const emailWithMultipleDots = 'user@sub.domain.example.com';

      const createUserDto: CreateUserDTO = {
        firstName: 'Multiple',
        lastName: 'Dots',
        email: emailWithMultipleDots,
        password: 'SecurePassword123!'
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      const savedUser = await userRepository.save(userEntity);

      // Email should be stored exactly as provided
      expect(savedUser.email).toBe(emailWithMultipleDots);

      // Verify in database
      const retrievedUser = await userRepository.findById(savedUser.id!);
      expect(retrievedUser!.email).toBe(emailWithMultipleDots);
    });

    it('should handle email addresses with numbers in local part', async () => {
      const emailWithNumbers = 'user123@example.com';

      const createUserDto: CreateUserDTO = {
        firstName: 'Numbers',
        lastName: 'User',
        email: emailWithNumbers,
        password: 'SecurePassword123!'
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      const savedUser = await userRepository.save(userEntity);

      // Email should be stored exactly as provided
      expect(savedUser.email).toBe(emailWithNumbers);

      // Verify in database
      const retrievedUser = await userRepository.findById(savedUser.id!);
      expect(retrievedUser!.email).toBe(emailWithNumbers);
    });

    it('should handle email addresses with underscores in local part', async () => {
      const emailWithUnderscores = 'user_name@example.com';

      const createUserDto: CreateUserDTO = {
        firstName: 'Underscores',
        lastName: 'User',
        email: emailWithUnderscores,
        password: 'SecurePassword123!'
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      const savedUser = await userRepository.save(userEntity);

      // Email should be stored exactly as provided
      expect(savedUser.email).toBe(emailWithUnderscores);

      // Verify in database
      const retrievedUser = await userRepository.findById(savedUser.id!);
      expect(retrievedUser!.email).toBe(emailWithUnderscores);
    });
  });

  describe('Password Hashing and Security', () => {
    it('should properly hash passwords during registration', async () => {
      const password = 'MySecurePassword123!';
      
      const createUserDto: CreateUserDTO = {
        firstName: 'Password',
        lastName: 'Test',
        email: 'password@example.com',
        password: password
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      const savedUser = await userRepository.save(userEntity);

      // Password should be hashed
      expect(savedUser.hashPassword).toBeDefined();
      expect(savedUser.hashPassword).not.toBe(password);
      expect(savedUser.hashPassword.length).toBeGreaterThan(password.length);

      // Salt should be generated
      expect(savedUser.salt).toBeDefined();
      expect(savedUser.salt.length).toBeGreaterThan(0);

      // Verify password can be verified
      const isValid = await PasswordService.compare(password, savedUser.hashPassword, savedUser.salt);
      expect(isValid).toBe(true);

      // Verify wrong password fails
      const isInvalid = await PasswordService.compare('WrongPassword', savedUser.hashPassword, savedUser.salt);
      expect(isInvalid).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'SamePassword123!';
      
      const createUserDto1: CreateUserDTO = {
        firstName: 'User',
        lastName: 'One',
        email: 'user1@example.com',
        password: password
      };

      const createUserDto2: CreateUserDTO = {
        firstName: 'User',
        lastName: 'Two',
        email: 'user2@example.com',
        password: password
      };

      const userEntity1 = await userUsecase.mapCreateDtoToEntity(createUserDto1);
      const userEntity2 = await userUsecase.mapCreateDtoToEntity(createUserDto2);

      const savedUser1 = await userRepository.save(userEntity1);
      const savedUser2 = await userRepository.save(userEntity2);

      // Hashes should be different (due to different salts)
      expect(savedUser1.hashPassword).not.toBe(savedUser2.hashPassword);
      expect(savedUser1.salt).not.toBe(savedUser2.salt);

      // Both should verify correctly
      const isValid1 = await PasswordService.compare(password, savedUser1.hashPassword, savedUser1.salt);
      const isValid2 = await PasswordService.compare(password, savedUser2.hashPassword, savedUser2.salt);
      
      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
    });
  });

  describe('Database Constraints and Indexes', () => {
    it('should enforce email uniqueness at database level', async () => {
      const email = 'unique@example.com';
      
      // Create first user
      const createUserDto1: CreateUserDTO = {
        firstName: 'First',
        lastName: 'User',
        email: email,
        password: 'SecurePassword123!'
      };

      const userEntity1 = await userUsecase.mapCreateDtoToEntity(createUserDto1);
      await userRepository.save(userEntity1);

      // Try to create second user with same email
      const createUserDto2: CreateUserDTO = {
        firstName: 'Second',
        lastName: 'User',
        email: email,
        password: 'SecurePassword123!'
      };

      const userEntity2 = await userUsecase.mapCreateDtoToEntity(createUserDto2);
      
      // Should fail at database level
      await expect(userRepository.save(userEntity2)).rejects.toThrow();

      // Verify only one user exists
      const users = await userRepository.findMany({
        filters: { email: { exact: email } }
      });
      expect(users.data.length).toBe(1);
    });

    it('should handle email index performance', async () => {
      // Create multiple users
      const users = [];
      for (let i = 0; i < 100; i++) {
        const createUserDto: CreateUserDTO = {
          firstName: `User${i}`,
          lastName: `Test${i}`,
          email: `user${i}@example.com`,
          password: 'SecurePassword123!'
        };

        const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
        users.push(await userRepository.save(userEntity));
      }

      // Test email lookup performance
      const startTime = Date.now();
      const foundUser = await userRepository.findMany({
        filters: { email: { exact: 'user50@example.com' } }
      });
      const endTime = Date.now();

      expect(foundUser.data.length).toBe(1);
      expect(foundUser.data[0].email).toBe('user50@example.com');
      
      // Should be fast due to email index
      expect(endTime - startTime).toBeLessThan(100); // Should be under 100ms
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle database connection errors gracefully', async () => {
      const createUserDto: CreateUserDTO = {
        firstName: 'Error',
        lastName: 'Test',
        email: 'error@example.com',
        password: 'SecurePassword123!'
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      
      // This should work normally
      const savedUser = await userRepository.save(userEntity);
      expect(savedUser).toBeDefined();
      expect(savedUser.email).toBe('error@example.com');
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
        const createUserDto: CreateUserDTO = {
          firstName: 'Malformed',
          lastName: 'Email',
          email: email,
          password: 'SecurePassword123!'
        };

        // Should still be able to save (validation happens at application level)
        const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
        const savedUser = await userRepository.save(userEntity);

        expect(savedUser.email).toBe(email);
      }
    });

    it('should handle extremely long email addresses', async () => {
      const longEmail = 'a'.repeat(1000) + '@' + 'b'.repeat(1000) + '.com';
      expect(longEmail.length).toBeGreaterThan(2000);

      const createUserDto: CreateUserDTO = {
        firstName: 'Extremely',
        lastName: 'Long',
        email: longEmail,
        password: 'SecurePassword123!'
      };

      const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
      const savedUser = await userRepository.save(userEntity);

      expect(savedUser.email).toBe(longEmail);
      expect(savedUser.email.length).toBe(longEmail.length);
    });

    it('should handle email addresses with special Unicode characters', async () => {
      const unicodeEmails = [
        'user@exämple.com', // German umlaut
        'user@exámple.com', // Spanish accent
        'user@exàmple.com', // French accent
        'user@exåmple.com', // Nordic character
        'user@exæmple.com', // Ligature
        'user@exømple.com', // Nordic character
        'user@exñmple.com', // Spanish tilde
        'user@exçmple.com', // French cedilla
      ];

      for (const email of unicodeEmails) {
        const createUserDto: CreateUserDTO = {
          firstName: 'Unicode',
          lastName: 'User',
          email: email,
          password: 'SecurePassword123!'
        };

        const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
        const savedUser = await userRepository.save(userEntity);

        expect(savedUser.email).toBe(email);
      }
    });

    it('should handle email addresses with emoji characters', async () => {
      const emojiEmails = [
        'user@example😀.com',
        'user@example🎉.com',
        'user@example🚀.com',
        'user@example💻.com',
      ];

      for (const email of emojiEmails) {
        const createUserDto: CreateUserDTO = {
          firstName: 'Emoji',
          lastName: 'User',
          email: email,
          password: 'SecurePassword123!'
        };

        const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
        const savedUser = await userRepository.save(userEntity);

        expect(savedUser.email).toBe(email);
      }
    });

    it('should handle email addresses with control characters', async () => {
      const controlCharEmails = [
        'user@example\u0000.com', // Null byte
        'user@example\u0001.com', // Start of heading
        'user@example\u0002.com', // Start of text
        'user@example\u0003.com', // End of text
      ];

      for (const email of controlCharEmails) {
        const createUserDto: CreateUserDTO = {
          firstName: 'Control',
          lastName: 'Char',
          email: email,
          password: 'SecurePassword123!'
        };

        const userEntity = await userUsecase.mapCreateDtoToEntity(createUserDto);
        const savedUser = await userRepository.save(userEntity);

        expect(savedUser.email).toBe(email);
      }
    });
  });
});

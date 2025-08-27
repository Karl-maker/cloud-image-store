import { UserUsecase } from '../../domain/usecases/user.usecase';
import { UserRepository } from '../../domain/repositories/user.repository';
import { SpaceRepository } from '../../domain/repositories/space.repository';
import { User } from '../../domain/entities/user';
import { Space } from '../../domain/entities/space';
import { PasswordService } from '../../application/services/password/password.service';
import { JwtTokenService } from '../../application/services/token/jwt.token.service';
import { SendEmail } from '../../application/services/send-email/nodemailer.email.service';
import { wasMinutesAgo } from '../../utils/x.mins.ago.util';
import { bytesToMB } from '../../utils/bytes.to.mb';
import { NotFoundException } from '../../application/exceptions/not.found';
import { ValidationException } from '../../application/exceptions/validation.exception';
import { HttpException } from '../../application/exceptions/http.exception';
import { CreateUserDTO } from '../../domain/interfaces/presenters/dtos/create.user.dto';
import { UpdateUserDTO } from '../../domain/interfaces/presenters/dtos/update.user.dto';
import { LoginUserDTO } from '../../domain/interfaces/presenters/dtos/login.user.dto';
import { RecoverUserDTO } from '../../domain/interfaces/presenters/dtos/recover.user.dto';
import { SendConfirmationEmailDTO } from '../../domain/interfaces/presenters/dtos/send.confirmation.email.dto';
import { VerifyConfirmationDTO } from '../../domain/interfaces/presenters/dtos/verify.confirmation.dto';
import { Subscription } from '../../domain/entities/subscription';
import { SubscriptionPlan } from '../../domain/entities/subscription.plan';
import { FindParams, FindResponse, DeleteResponse } from '../../domain/types/repository';
import { UserFilterBy, UserSortBy } from '../../domain/types/user';

// Mock the external dependencies
jest.mock('../../application/services/password/password.service');
jest.mock('../../application/services/token/jwt.token.service');
jest.mock('../../application/services/send-email/nodemailer.email.service');
jest.mock('../../utils/x.mins.ago.util');
jest.mock('../../utils/bytes.to.mb');

// Mock configuration constants
jest.mock('../../application/configuration', () => ({
  COMPANY_DOMAIN: 'https://test.com',
  CONFIRMATION_SECRET: 'test-confirmation-secret',
  TOKEN_SECRET: 'test-token-secret',
  EMAIL_NO_REPLY_USER: 'noreply@test.com',
  EMAIL_NO_REPLY_SERVICE: 'gmail',
  EMAIL_NO_REPLY_PASS: 'test-password'
}));

jest.mock('../../domain/constants/client.routes', () => ({
  CONFIRMATION_PATH: '/confirm',
  RECOVERY_PATH: '/recover'
}));

// Mock repository implementations
class MockUserRepository implements UserRepository {
  private users: User[] = [];

  async save(entity: User): Promise<User> {
    const existingIndex = this.users.findIndex(u => u.id === entity.id);
    if (existingIndex !== -1) {
      this.users[existingIndex] = entity;
    } else {
      if (!entity.id) {
        entity.id = `user-${Date.now()}`;
      }
      this.users.push(entity);
    }
    return entity;
  }

  async findMany(params?: FindParams<UserSortBy, UserFilterBy>): Promise<FindResponse<User>> {
    let filteredUsers = [...this.users];

    // Apply filters if provided
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, filter]) => {
        if (filter?.exact !== undefined) {
          filteredUsers = filteredUsers.filter(user => 
            (user as any)[key] === filter.exact
          );
        }
        if (filter?.contains !== undefined) {
          filteredUsers = filteredUsers.filter(user => 
            (user as any)[key]?.toString().includes(filter.contains!.toString())
          );
        }
      });
    }

    const pageNumber = params?.pageNumber || 1;
    const pageSize = params?.pageSize || filteredUsers.length;
    
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    
    return {
      data: paginatedUsers,
      pagination: {
        totalItems: filteredUsers.length,
        totalPages: totalPages,
        currentPage: pageNumber,
        pageSize: pageSize
      }
    };
  }

  async findManyIgnoreDeletion(params?: FindParams<UserSortBy, UserFilterBy>): Promise<FindResponse<User>> {
    return this.findMany(params);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async delete(data: User): Promise<DeleteResponse<User>> {
    const index = this.users.findIndex(u => u.id === data.id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return { data };
    }
    return { data };
  }

  // Helper methods for testing
  addUser(user: User): void {
    this.users.push(user);
  }

  clearUsers(): void {
    this.users = [];
  }

  getUsers(): User[] {
    return [...this.users];
  }
}

class MockSpaceRepository implements SpaceRepository {
  // IMPORTANT: space.usedMegabytes field stores values in BYTES, not megabytes (legacy naming issue)
  private spaces: Space[] = [];

  async addUsedMegabytes(id: string, amount: number): Promise<boolean> {
    const space = this.spaces.find(s => s.id === id);
    if (space) {
      space.usedMegabytes += amount;
      return true;
    }
    return false;
  }

  async save(entity: Space): Promise<Space> {
    const existingIndex = this.spaces.findIndex(s => s.id === entity.id);
    if (existingIndex !== -1) {
      this.spaces[existingIndex] = entity;
    } else {
      if (!entity.id) {
        entity.id = `space-${Date.now()}`;
      }
      this.spaces.push(entity);
    }
    return entity;
  }

  async findMany(params?: FindParams<any, any>): Promise<FindResponse<Space>> {
    let filteredSpaces = [...this.spaces];

    // Apply filters if provided
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, filter]) => {
        if (filter?.exact !== undefined) {
          filteredSpaces = filteredSpaces.filter(space => 
            (space as any)[key] === filter.exact
          );
        }
      });
    }

    const pageNumber = params?.pageNumber || 1;
    const pageSize = params?.pageSize || filteredSpaces.length;
    
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedSpaces = filteredSpaces.slice(startIndex, endIndex);
    
    const totalPages = Math.ceil(filteredSpaces.length / pageSize);
    
    return {
      data: paginatedSpaces,
      pagination: {
        totalItems: filteredSpaces.length,
        totalPages: totalPages,
        currentPage: pageNumber,
        pageSize: pageSize
      }
    };
  }

  async findManyIgnoreDeletion(params?: FindParams<any, any>): Promise<FindResponse<Space>> {
    return this.findMany(params);
  }

  async findById(id: string): Promise<Space | null> {
    return this.spaces.find(s => s.id === id) || null;
  }

  async delete(data: Space): Promise<DeleteResponse<Space>> {
    const index = this.spaces.findIndex(s => s.id === data.id);
    if (index !== -1) {
      this.spaces.splice(index, 1);
      return { data };
    }
    return { data };
  }

  // Helper methods for testing
  addSpace(space: Space): void {
    this.spaces.push(space);
  }

  clearSpaces(): void {
    this.spaces = [];
  }
}

describe('UserUsecase', () => {
  let userUsecase: UserUsecase;
  let mockUserRepository: MockUserRepository;
  let mockSpaceRepository: MockSpaceRepository;
  let mockPasswordService: jest.Mocked<typeof PasswordService>;
  let mockJwtTokenService: jest.Mocked<JwtTokenService<any>>;
  let mockSendEmail: jest.Mocked<SendEmail>;
  let mockWasMinutesAgo: jest.MockedFunction<typeof wasMinutesAgo>;
  let mockBytesToMB: jest.MockedFunction<typeof bytesToMB>;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockSpaceRepository = new MockSpaceRepository();
    userUsecase = new UserUsecase(mockUserRepository, mockSpaceRepository);

    // Setup mocks
    mockPasswordService = PasswordService as jest.Mocked<typeof PasswordService>;
    mockWasMinutesAgo = wasMinutesAgo as jest.MockedFunction<typeof wasMinutesAgo>;
    mockBytesToMB = bytesToMB as jest.MockedFunction<typeof bytesToMB>;

    // Clear all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    mockPasswordService.hash = jest.fn();
    mockPasswordService.compare = jest.fn();
    
    // Mock JwtTokenService constructor and methods
    const mockGenerate = jest.fn();
    const mockValidate = jest.fn();
    jest.spyOn(JwtTokenService.prototype, 'generate').mockImplementation(mockGenerate);
    jest.spyOn(JwtTokenService.prototype, 'validate').mockImplementation(mockValidate);
    mockJwtTokenService = {
      generate: mockGenerate,
      validate: mockValidate
    } as any;

    // Mock SendEmail constructor and methods
    const mockSend = jest.fn();
    jest.spyOn(SendEmail.prototype, 'send').mockImplementation(mockSend);
    mockSendEmail = {
      send: mockSend
    } as any;
  });

  afterEach(() => {
    mockUserRepository.clearUsers();
    mockSpaceRepository.clearSpaces();
  });

  describe('mapCreateDtoToEntity', () => {
    it('should map CreateUserDTO to User entity successfully', async () => {
      const createUserDto: CreateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      };

      const hashResults = {
        pass: 'hashed-password',
        salt: 'random-salt'
      };

      mockPasswordService.hash.mockResolvedValue(hashResults);

      const result = await userUsecase.mapCreateDtoToEntity(createUserDto);

      expect(result).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        hashPassword: 'hashed-password',
        salt: 'random-salt',
        confirmed: false,
        id: null,
        stripeId: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      });

      expect(mockPasswordService.hash).toHaveBeenCalledWith('password123');
    });
  });

  describe('mapUpdateDtoToEntity', () => {
    it('should update user without password change', async () => {
      const existingUser: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        hashPassword: 'old-hash',
        salt: 'old-salt',
        confirmed: true,
        stripeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        maxUsers: 5,
        maxSpaces: 3,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 10
      };

      const updateDto: UpdateUserDTO = {
        firstName: 'Jane',
        lastName: 'Smith'
      };

      const result = await userUsecase.mapUpdateDtoToEntity(updateDto, existingUser);

      expect(result).toEqual({
        ...existingUser,
        firstName: 'Jane',
        lastName: 'Smith'
      });
    });

    it('should update user with password change when allowed', async () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 20); // 20 minutes ago

      const existingUser: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        hashPassword: 'old-hash',
        salt: 'old-salt',
        confirmed: true,
        stripeId: null,
        lastPasswordUpdate: pastDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        maxUsers: 5,
        maxSpaces: 3,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 10
      };

      const updateDto: UpdateUserDTO = {
        password: 'newPassword123'
      };

      const hashResults = {
        pass: 'new-hashed-password',
        salt: 'new-salt'
      };

      mockPasswordService.hash.mockResolvedValue(hashResults);
      mockWasMinutesAgo.mockReturnValue(true); // Password update was 20 minutes ago

      const result = await userUsecase.mapUpdateDtoToEntity(updateDto, existingUser);

      expect(result.hashPassword).toBe('new-hashed-password');
      expect(result.salt).toBe('new-salt');
      expect(result.lastPasswordUpdate).toBeInstanceOf(Date);
      expect(mockPasswordService.hash).toHaveBeenCalledWith('newPassword123');
    });

    it('should throw ValidationException when password update too recent', async () => {
      const recentDate = new Date();
      recentDate.setMinutes(recentDate.getMinutes() - 5); // 5 minutes ago

      const existingUser: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        hashPassword: 'old-hash',
        salt: 'old-salt',
        confirmed: true,
        stripeId: null,
        lastPasswordUpdate: recentDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        maxUsers: 5,
        maxSpaces: 3,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 10
      };

      const updateDto: UpdateUserDTO = {
        password: 'newPassword123'
      };

      mockWasMinutesAgo.mockReturnValue(false); // Password update was recent

      await expect(userUsecase.mapUpdateDtoToEntity(updateDto, existingUser))
        .rejects
        .toThrow(HttpException);
    });
  });

  describe('sendConfirmationEmail', () => {
    it('should send confirmation email successfully', async () => {
      const user: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        hashPassword: 'hash',
        salt: 'salt',
        confirmed: false,
        stripeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserRepository.addUser(user);

      const sendConfirmationDto: SendConfirmationEmailDTO = {
        userId: 'user-1'
      };

      mockJwtTokenService.generate.mockResolvedValue('confirmation-token');
      mockSendEmail.send.mockResolvedValue();

      await userUsecase.sendConfirmationEmail(sendConfirmationDto);

      expect(mockJwtTokenService.generate).toHaveBeenCalledWith(
        { userId: 'user-1' },
        'test-confirmation-secret',
        expect.objectContaining({
          issuer: 'confirmation',
          audience: 'cloud-photo-share'
        })
      );
      expect(mockSendEmail.send).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      const sendConfirmationDto: SendConfirmationEmailDTO = {
        userId: 'non-existent-user'
      };

      await expect(userUsecase.sendConfirmationEmail(sendConfirmationDto))
        .rejects
        .toThrow(HttpException);
    });
  });

  describe('checkConfirmationToken', () => {
    it('should confirm user successfully with valid token', async () => {
      const user: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        hashPassword: 'hash',
        salt: 'salt',
        confirmed: false,
        stripeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserRepository.addUser(user);

      const verifyDto: VerifyConfirmationDTO = {
        token: 'valid-token'
      };

      mockJwtTokenService.validate.mockResolvedValue({ userId: 'user-1' });

      const result = await userUsecase.checkConfirmationToken(verifyDto);

      expect(result.confirmed).toBe(true);
      expect(mockJwtTokenService.validate).toHaveBeenCalledWith(
        'valid-token',
        'test-confirmation-secret'
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      const verifyDto: VerifyConfirmationDTO = {
        token: 'valid-token'
      };

      mockJwtTokenService.validate.mockResolvedValue({ userId: 'non-existent-user' });

      await expect(userUsecase.checkConfirmationToken(verifyDto))
        .rejects
        .toThrow(HttpException);
    });
  });

  describe('recover', () => {
    it('should send recovery email successfully', async () => {
      const user: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        hashPassword: 'hash',
        salt: 'salt',
        confirmed: true,
        stripeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserRepository.addUser(user);

      const recoverDto: RecoverUserDTO = {
        email: 'john@example.com'
      };

      mockJwtTokenService.generate.mockResolvedValue('recovery-token');
      mockSendEmail.send.mockResolvedValue();

      await userUsecase.recover(recoverDto);

      expect(mockJwtTokenService.generate).toHaveBeenCalledWith(
        { id: 'user-1' },
        'test-token-secret',
        expect.objectContaining({
          issuer: 'recovery',
          audience: 'cloud-photo-share'
        })
      );
      expect(mockSendEmail.send).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      const recoverDto: RecoverUserDTO = {
        email: 'nonexistent@example.com'
      };

      await expect(userUsecase.recover(recoverDto))
        .rejects
        .toThrow(HttpException);
    });

    it('should throw ValidationException when recovery too recent', async () => {
      const recentDate = new Date();
      recentDate.setMinutes(recentDate.getMinutes() - 5);

      const user: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        hashPassword: 'hash',
        salt: 'salt',
        confirmed: true,
        stripeId: null,
        lastPasswordUpdate: recentDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserRepository.addUser(user);

      const recoverDto: RecoverUserDTO = {
        email: 'john@example.com'
      };

      mockWasMinutesAgo.mockReturnValue(false);

      await expect(userUsecase.recover(recoverDto))
        .rejects
        .toThrow(HttpException);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const user: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        hashPassword: 'hashed-password',
        salt: 'salt',
        confirmed: true,
        stripeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserRepository.addUser(user);

      const loginDto: LoginUserDTO = {
        email: 'john@example.com',
        password: 'password123'
      };

      mockPasswordService.compare.mockResolvedValue(true);
      mockJwtTokenService.generate.mockResolvedValue('access-token');

      const result = await userUsecase.login(loginDto);

      expect(result.accessToken).toBe('access-token');
      expect(mockPasswordService.compare).toHaveBeenCalledWith(
        'password123',
        'hashed-password',
        'salt'
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      const loginDto: LoginUserDTO = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      await expect(userUsecase.login(loginDto))
        .rejects
        .toThrow(HttpException);
    });

    it('should throw ValidationException with invalid password', async () => {
      const user: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        hashPassword: 'hashed-password',
        salt: 'salt',
        confirmed: true,
        stripeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserRepository.addUser(user);

      const loginDto: LoginUserDTO = {
        email: 'john@example.com',
        password: 'wrong-password'
      };

      mockPasswordService.compare.mockResolvedValue(false);

      await expect(userUsecase.login(loginDto))
        .rejects
        .toThrow(HttpException);
    });
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const createUserDto: CreateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const hashResults = {
        pass: 'hashed-password',
        salt: 'salt'
      };

      mockPasswordService.hash.mockResolvedValue(hashResults);
      mockPasswordService.compare.mockResolvedValue(true);
      mockJwtTokenService.generate.mockResolvedValue('access-token');

      const result = await userUsecase.register(createUserDto);

      expect(result.user.firstName).toBe('John');
      expect(result.user.lastName).toBe('Doe');
      expect(result.user.email).toBe('john@example.com');
      expect(result.accessToken).toBe('access-token');
    });

    it('should throw HttpException when save fails', async () => {
      const createUserDto: CreateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      mockPasswordService.hash.mockResolvedValue({
        pass: 'hashed-password',
        salt: 'salt'
      });

      // Mock repository save to return null
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(null as any);

      await expect(userUsecase.register(createUserDto))
        .rejects
        .toThrow(HttpException);
    });
  });

  describe('subscribedToPlan', () => {
    it('should update user subscription successfully', async () => {
      const user: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        hashPassword: 'hash',
        salt: 'salt',
        confirmed: true,
        stripeId: 'cus_test123',
        createdAt: new Date(),
        updatedAt: new Date(),
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserRepository.addUser(user);

      const subscription: Subscription = {
        id: 'sub_test123',
        customerId: 'cus_test123',
        planId: 'plan_test123',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const subscriptionPlan: SubscriptionPlan = {
        id: 'plan_test123',
        name: 'Pro Plan',
        description: 'Professional plan with premium features',
        megabytes: 5000,
        users: 10,
        spaces: 20,
        aiGenerationsPerMonth: 100,
        prices: [],
        features: [],
        highlighted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await userUsecase.subscribedToPlan('cus_test123', subscription, subscriptionPlan);

      expect(result).toBeInstanceOf(Object);
      if (result instanceof Error || result instanceof NotFoundException) {
        fail('Expected successful result');
      } else {
        expect(result.maxStorage).toBe(5000);
        expect(result.maxUsers).toBe(10);
        expect(result.maxSpaces).toBe(20);
        expect(result.maxAiEnhancementsPerMonth).toBe(100);
        expect(result.subscriptionPlanStripeId).toBe('plan_test123');
        expect(result.subscriptionStripeId).toBe('sub_test123');
      }
    });

    it('should return NotFoundException when user not found', async () => {
      const subscription: Subscription = {
        id: 'sub_test123',
        customerId: 'cus_nonexistent',
        planId: 'plan_test123',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const subscriptionPlan: SubscriptionPlan = {
        id: 'plan_test123',
        name: 'Pro Plan',
        description: 'Professional plan with premium features',
        megabytes: 5000,
        users: 10,
        spaces: 20,
        prices: [],
        features: [],
        highlighted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await userUsecase.subscribedToPlan('cus_nonexistent', subscription, subscriptionPlan);

      expect(result).toBeInstanceOf(HttpException);
    });
  });

  describe('getSystemUsage', () => {
    it('should return system usage successfully', async () => {
      // IMPORTANT: space.usedMegabytes field is misleadingly named but stores values in BYTES, not megabytes
      // This is a legacy naming issue that must be preserved for backward compatibility
      // The code correctly converts from bytes to megabytes using bytesToMB() function
      const user: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        hashPassword: 'hash',
        salt: 'salt',
        confirmed: true,
        stripeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        maxUsers: 10,
        maxSpaces: 5,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      const space1: Space = {
        id: 'space-1',
        name: 'Space 1',
        description: 'Test space 1',
        userIds: ['user-1'],
        createdByUserId: 'user-1',
        usedMegabytes: 50 * 1024 * 1024, // 50 MB in bytes (despite misleading field name)
        shareType: 'private',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const space2: Space = {
        id: 'space-2',
        name: 'Space 2',
        description: 'Test space 2',
        userIds: ['user-1'],
        createdByUserId: 'user-1',
        usedMegabytes: 30 * 1024 * 1024, // 30 MB in bytes (despite misleading field name)
        shareType: 'public',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.addUser(user);
      mockSpaceRepository.addSpace(space1);
      mockSpaceRepository.addSpace(space2);

      // Mock bytesToMB to return the expected values for conversion from bytes to MB
      mockBytesToMB.mockImplementation((bytes) => {
        if (bytes === 80 * 1024 * 1024) return 80; // Total used (50MB + 30MB = 80MB)
        if (bytes === 50 * 1024 * 1024) return 50; // Space 1 (50MB)
        if (bytes === 30 * 1024 * 1024) return 30; // Space 2 (30MB)
        return 0;
      });

      const result = await userUsecase.getSystemUsage('user-1');

      expect(result.user.id).toBe('user-1');
      expect(result.user.firstName).toBe('John');
      expect(result.storage.usedMegabytes).toBe(80); // Converted from bytes to MB
      expect(result.storage.maxStorage).toBe(1000);
      expect(result.storage.usagePercentage).toBe(8); // 80/1000 * 100
      expect(result.spaces.totalSpaces).toBe(2);
      expect(result.spaces.maxSpaces).toBe(5);
      expect(result.spaces.spacesUsagePercentage).toBe(40); // 2/5 * 100
      expect(result.limits.maxUsers).toBe(10);
      expect(result.limits.maxAiEnhancementsPerMonth).toBe(50);
      expect(result.spaceDetails).toHaveLength(2);
      // Verify that spaceDetails also have converted values
      expect(result.spaceDetails[0].usedMegabytes).toBe(50); // Converted from bytes
      expect(result.spaceDetails[1].usedMegabytes).toBe(30); // Converted from bytes
    });

    it('should throw NotFoundException when user not found', async () => {
      await expect(userUsecase.getSystemUsage('non-existent-user'))
        .rejects
        .toThrow(HttpException);
    });

    it('should throw Error when space repository not initialized', async () => {
      const usecaseWithoutSpaceRepo = new UserUsecase(mockUserRepository);
      
      const user: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        hashPassword: 'hash',
        salt: 'salt',
        confirmed: true,
        stripeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        maxUsers: 10,
        maxSpaces: 5,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      mockUserRepository.addUser(user);

      await expect(usecaseWithoutSpaceRepo.getSystemUsage('user-1'))
        .rejects
        .toThrow('Space repository not initialized');
    });
  });

  describe('subscriptionEnd', () => {
    it('should end subscription successfully', async () => {
      const user: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        hashPassword: 'hash',
        salt: 'salt',
        confirmed: true,
        stripeId: 'cus_test123',
        createdAt: new Date(),
        updatedAt: new Date(),
        maxUsers: 10,
        maxSpaces: 5,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      mockUserRepository.addUser(user);

      const result = await userUsecase.subscriptionEnd('cus_test123');

      expect(result).toBeInstanceOf(Object);
      if (result instanceof Error || result instanceof NotFoundException) {
        fail('Expected successful result');
      } else {
        expect(result.subscriptionPlanExpiresAt).toBeInstanceOf(Date);
      }
    });

    it('should return NotFoundException when user not found', async () => {
      const result = await userUsecase.subscriptionEnd('cus_nonexistent');
      expect(result).toBeInstanceOf(HttpException);
    });
  });

  describe('subscriptionPaused', () => {
    it('should pause subscription successfully', async () => {
      const user: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        hashPassword: 'hash',
        salt: 'salt',
        confirmed: true,
        stripeId: 'cus_test123',
        createdAt: new Date(),
        updatedAt: new Date(),
        maxUsers: 10,
        maxSpaces: 5,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      mockUserRepository.addUser(user);

      const result = await userUsecase.subscriptionPaused('cus_test123');

      expect(result).toBeInstanceOf(Object);
      if (result instanceof Error || result instanceof NotFoundException) {
        fail('Expected successful result');
      } else {
        expect(result.subscriptionPlanExpiresAt).toBeInstanceOf(Date);
      }
    });
  });

  describe('subscriptionResumed', () => {
    it('should resume subscription successfully', async () => {
      const user: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        hashPassword: 'hash',
        salt: 'salt',
        confirmed: true,
        stripeId: 'cus_test123',
        subscriptionPlanExpiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        maxUsers: 10,
        maxSpaces: 5,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      mockUserRepository.addUser(user);

      const result = await userUsecase.subscriptionResumed('cus_test123');

      expect(result).toBeInstanceOf(Object);
      if (result instanceof Error || result instanceof NotFoundException) {
        fail('Expected successful result');
      } else {
        expect(result.subscriptionPlanExpiresAt).toBeUndefined();
      }
    });
  });

  describe('receiveProduct', () => {
    it('should update user with product successfully', async () => {
      const user: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        hashPassword: 'hash',
        salt: 'salt',
        confirmed: true,
        stripeId: 'cus_test123',
        createdAt: new Date(),
        updatedAt: new Date(),
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      const plan: SubscriptionPlan = {
        id: 'plan_test123',
        name: 'Pro Plan',
        description: 'Professional plan with premium features',
        megabytes: 5000,
        users: 10,
        spaces: 20,
        aiGenerationsPerMonth: 100,
        prices: [],
        features: [],
        highlighted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await userUsecase.receiveProduct(plan, user);

      expect(result).toBeInstanceOf(Object);
      if (result instanceof Error || result instanceof NotFoundException) {
        fail('Expected successful result');
      } else {
        expect(result.maxStorage).toBe(5000);
        expect(result.maxUsers).toBe(10);
        expect(result.maxSpaces).toBe(20);
        expect(result.maxAiEnhancementsPerMonth).toBe(100);
        expect(result.subscriptionPlanExpiresAt).toBeInstanceOf(Date);
        expect(result.subscriptionPlanStripeId).toBe('plan_test123');
        expect(result.subscriptionStripeId).toBeUndefined();
      }
    });
  });
});

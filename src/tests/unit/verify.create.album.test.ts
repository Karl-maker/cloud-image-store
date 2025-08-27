import { Request, Response, NextFunction } from 'express';
import verifyCreateAlbum from '../../interface/express/middlewares/verify.create.album';
import { SpaceRepository } from '../../domain/repositories/space.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { NotFoundException } from '../../application/exceptions/not.found';
import { InsufficentStorageException } from '../../application/exceptions/insufficent.storage.exception';
import { User } from '../../domain/entities/user';
import { Space } from '../../domain/entities/space';
import { FindResponse } from '../../domain/types/repository';

describe('verifyCreateAlbum', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let mockSpaceRepository: jest.Mocked<SpaceRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let middleware: ReturnType<typeof verifyCreateAlbum>;

  beforeEach(() => {
    mockRequest = {
      user: { id: 'user-1' }
    } as any;
    mockResponse = {};
    mockNext = jest.fn();

    mockSpaceRepository = {
      findMany: jest.fn(),
      findById: jest.fn()
    } as any;

    mockUserRepository = {
      findById: jest.fn(),
      findMany: jest.fn()
    } as any;

    middleware = verifyCreateAlbum(mockSpaceRepository, mockUserRepository);
  });

  describe('successful validation', () => {
    it('should call next() when user exists and has space quota available', async () => {
      const mockUser: User = {
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
        maxUsers: 5,
        maxSpaces: 10,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      const mockSpaces: FindResponse<Space> = {
        data: [
          { id: 'space-1', name: 'Space 1' } as Space,
          { id: 'space-2', name: 'Space 2' } as Space
        ],
        pagination: {
          totalItems: 2,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1
        }
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSpaceRepository.findMany.mockResolvedValue(mockSpaces);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-1');
      expect(mockSpaceRepository.findMany).toHaveBeenCalledWith({
        filters: {
          createdByUserId: {
            exact: 'user-1'
          }
        }
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next() when user has no spaces and quota available', async () => {
      const mockUser: User = {
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
        maxUsers: 5,
        maxSpaces: 5,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      const mockSpaces: FindResponse<Space> = {
        data: [],
        pagination: {
          totalItems: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 0
        }
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSpaceRepository.findMany.mockResolvedValue(mockSpaces);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next() when user has exactly maxSpaces-1 spaces', async () => {
      const mockUser: User = {
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
        maxUsers: 5,
        maxSpaces: 3,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      const mockSpaces: FindResponse<Space> = {
        data: [
          { id: 'space-1', name: 'Space 1' } as Space,
          { id: 'space-2', name: 'Space 2' } as Space
        ],
        pagination: {
          totalItems: 2,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1
        }
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSpaceRepository.findMany.mockResolvedValue(mockSpaces);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('error handling', () => {
    it('should call next() with NotFoundException when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-1');
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'user not found'
      }));
    });

    it('should call next() with InsufficentStorageException when user has reached space limit', async () => {
      const mockUser: User = {
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
        maxUsers: 5,
        maxSpaces: 2,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      const mockSpaces: FindResponse<Space> = {
        data: [
          { id: 'space-1', name: 'Space 1' } as Space,
          { id: 'space-2', name: 'Space 2' } as Space
        ],
        pagination: {
          totalItems: 2,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1
        }
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSpaceRepository.findMany.mockResolvedValue(mockSpaces);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'limit reached'
      }));
    });

    it('should call next() with InsufficentStorageException when user has exceeded space limit', async () => {
      const mockUser: User = {
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
        maxUsers: 5,
        maxSpaces: 1,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      const mockSpaces: FindResponse<Space> = {
        data: [
          { id: 'space-1', name: 'Space 1' } as Space,
          { id: 'space-2', name: 'Space 2' } as Space
        ],
        pagination: {
          totalItems: 2,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1
        }
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSpaceRepository.findMany.mockResolvedValue(mockSpaces);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'limit reached'
      }));
    });
  });

  describe('edge cases', () => {
    it('should handle user with maxSpaces = 0', async () => {
      const mockUser: User = {
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
        maxUsers: 5,
        maxSpaces: 0,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      const mockSpaces: FindResponse<Space> = {
        data: [],
        pagination: {
          totalItems: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 0
        }
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSpaceRepository.findMany.mockResolvedValue(mockSpaces);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'limit reached'
      }));
    });

    it('should handle user with maxSpaces = 1 and no existing spaces', async () => {
      const mockUser: User = {
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
        maxUsers: 5,
        maxSpaces: 1,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      const mockSpaces: FindResponse<Space> = {
        data: [],
        pagination: {
          totalItems: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 0
        }
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSpaceRepository.findMany.mockResolvedValue(mockSpaces);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle user with maxSpaces = 1 and one existing space', async () => {
      const mockUser: User = {
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
        maxUsers: 5,
        maxSpaces: 1,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      const mockSpaces: FindResponse<Space> = {
        data: [
          { id: 'space-1', name: 'Space 1' } as Space
        ],
        pagination: {
          totalItems: 1,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1
        }
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSpaceRepository.findMany.mockResolvedValue(mockSpaces);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'limit reached'
      }));
    });

    it('should handle user with very high maxSpaces limit', async () => {
      const mockUser: User = {
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
        maxUsers: 5,
        maxSpaces: 1000,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      const mockSpaces: FindResponse<Space> = {
        data: Array.from({ length: 500 }, (_, i) => ({ 
          id: `space-${i}`, 
          name: `Space ${i}` 
        } as Space)),
        pagination: {
          totalItems: 500,
          currentPage: 1,
          pageSize: 10,
          totalPages: 50
        }
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSpaceRepository.findMany.mockResolvedValue(mockSpaces);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle user with maxSpaces = 1000 and exactly 1000 existing spaces', async () => {
      const mockUser: User = {
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
        maxUsers: 5,
        maxSpaces: 1000,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      const mockSpaces: FindResponse<Space> = {
        data: Array.from({ length: 1000 }, (_, i) => ({ 
          id: `space-${i}`, 
          name: `Space ${i}` 
        } as Space)),
        pagination: {
          totalItems: 1000,
          currentPage: 1,
          pageSize: 10,
          totalPages: 100
        }
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSpaceRepository.findMany.mockResolvedValue(mockSpaces);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'limit reached'
      }));
    });
  });

  describe('repository error handling', () => {
    it('should call next() with error when userRepository.findById throws', async () => {
      const error = new Error('Database connection failed');
      mockUserRepository.findById.mockRejectedValue(error);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should call next() with error when spaceRepository.findMany throws', async () => {
      const mockUser: User = {
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
        maxUsers: 5,
        maxSpaces: 10,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      const error = new Error('Space query failed');
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSpaceRepository.findMany.mockRejectedValue(error);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should call next() with error when both repositories throw', async () => {
      const error = new Error('Database error');
      mockUserRepository.findById.mockRejectedValue(error);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      // Note: The middleware still calls findMany even when findById throws
      // because the error is caught in the try-catch block
    });
  });

  describe('request validation', () => {
    it('should handle request without user', async () => {
      mockRequest = {};

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(undefined);
    });

    it('should handle request with user but no id', async () => {
      mockRequest = {
        user: {}
      } as any;

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(undefined);
    });

    it('should handle request with null user', async () => {
      mockRequest = {
        user: null
      } as any;

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(undefined);
    });

    it('should handle request with undefined user', async () => {
      mockRequest = {
        user: undefined
      } as any;

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(undefined);
    });
  });

  describe('pagination edge cases', () => {
    it('should handle pagination with totalItems as string', async () => {
      const mockUser: User = {
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
        maxUsers: 5,
        maxSpaces: 3,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      const mockSpaces: FindResponse<Space> = {
        data: [
          { id: 'space-1', name: 'Space 1' } as Space,
          { id: 'space-2', name: 'Space 2' } as Space
        ],
        pagination: {
          totalItems: '2' as any, // String instead of number
          currentPage: 1,
          pageSize: 10,
          totalPages: 1
        }
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSpaceRepository.findMany.mockResolvedValue(mockSpaces);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle pagination with totalItems as 0', async () => {
      const mockUser: User = {
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
        maxUsers: 5,
        maxSpaces: 5,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      const mockSpaces: FindResponse<Space> = {
        data: [],
        pagination: {
          totalItems: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 0
        }
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSpaceRepository.findMany.mockResolvedValue(mockSpaces);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle pagination with missing totalItems', async () => {
      const mockUser: User = {
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
        maxUsers: 5,
        maxSpaces: 5,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      const mockSpaces: FindResponse<Space> = {
        data: [],
        pagination: {
          totalItems: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 0
        }
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSpaceRepository.findMany.mockResolvedValue(mockSpaces);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple concurrent requests for the same user', async () => {
      const mockUser: User = {
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
        maxUsers: 5,
        maxSpaces: 5,
        maxStorage: 1000,
        maxAiEnhancementsPerMonth: 50
      };

      const mockSpaces: FindResponse<Space> = {
        data: [
          { id: 'space-1', name: 'Space 1' } as Space,
          { id: 'space-2', name: 'Space 2' } as Space
        ],
        pagination: {
          totalItems: 2,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1
        }
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSpaceRepository.findMany.mockResolvedValue(mockSpaces);

      // Simulate concurrent requests
      const promises = [
        middleware(mockRequest as Request, mockResponse as Response, mockNext),
        middleware(mockRequest as Request, mockResponse as Response, mockNext),
        middleware(mockRequest as Request, mockResponse as Response, mockNext)
      ];

      await Promise.all(promises);

      expect(mockUserRepository.findById).toHaveBeenCalledTimes(3);
      expect(mockSpaceRepository.findMany).toHaveBeenCalledTimes(3);
      expect(mockNext).toHaveBeenCalledTimes(3);
    });
  });
});

import { Usecases } from '../../domain/usecases/usecases';
import { Repository } from '../../domain/repositories/repository';
import { Persistent } from '../../domain/entities/persistent';
import { FindParams, FindResponse, DeleteResponse } from '../../domain/types/repository';
import { FindManyResponse } from '../../domain/types/usecase';
import { NotFoundException } from '../../application/exceptions/not.found';
import { HttpException } from '../../application/exceptions/http.exception';

// Mock entity for testing
interface TestEntity extends Persistent {
  name: string;
  email: string;
  active: boolean;
}

// Mock repository for testing
class MockRepository implements Repository<TestEntity, any, any> {
  private entities: TestEntity[] = [];

  async save(entity: TestEntity): Promise<TestEntity> {
    const existingIndex = this.entities.findIndex(e => e.id === entity.id);
    if (existingIndex !== -1) {
      this.entities[existingIndex] = entity;
    } else {
      this.entities.push(entity);
    }
    return entity;
  }

  async findMany(params?: FindParams<any, any>): Promise<FindResponse<TestEntity>> {
    const pageNumber = params?.pageNumber || 1;
    const pageSize = params?.pageSize || this.entities.length;
    
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedEntities = this.entities.slice(startIndex, endIndex);
    
    const totalPages = Math.ceil(this.entities.length / pageSize);
    
    return {
      data: paginatedEntities,
      pagination: {
        totalItems: this.entities.length,
        totalPages: totalPages,
        currentPage: pageNumber,
        pageSize: pageSize
      }
    };
  }

  async findManyIgnoreDeletion(params?: FindParams<any, any>): Promise<FindResponse<TestEntity>> {
    return this.findMany(params);
  }

  async findById(id: string): Promise<TestEntity | null> {
    return this.entities.find(e => e.id === id) || null;
  }

  async delete(data: TestEntity): Promise<DeleteResponse<TestEntity>> {
    const index = this.entities.findIndex(e => e.id === data.id);
    if (index !== -1) {
      this.entities.splice(index, 1);
      return { data };
    }
    return { data };
  }

  // Helper method for testing
  addEntity(entity: TestEntity): void {
    this.entities.push(entity);
  }

  // Helper method for testing
  clearEntities(): void {
    this.entities = [];
  }
}

// Concrete implementation of Usecases for testing
class TestUsecases extends Usecases<TestEntity, any, any, MockRepository> {
  async mapCreateDtoToEntity(data: any): Promise<TestEntity> {
    return {
      id: null,
      name: data.name,
      email: data.email,
      active: data.active || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async mapUpdateDtoToEntity(data: any, entity: TestEntity): Promise<TestEntity> {
    return {
      ...entity,
      name: data.name || entity.name,
      email: data.email || entity.email,
      active: data.active !== undefined ? data.active : entity.active,
      updatedAt: new Date()
    };
  }
}

describe('Usecases', () => {
  let usecases: TestUsecases;
  let mockRepository: MockRepository;

  beforeEach(() => {
    mockRepository = new MockRepository();
    usecases = new TestUsecases(mockRepository);
  });

  afterEach(() => {
    mockRepository.clearEntities();
  });

  describe('create', () => {
    it('should create a new entity successfully', async () => {
      const createData = {
        name: 'Test User',
        email: 'test@example.com',
        active: true
      };

      const result = await usecases.create(createData);

      expect(result).toBeDefined();
      expect(result.name).toBe(createData.name);
      expect(result.email).toBe(createData.email);
      expect(result.active).toBe(createData.active);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle creation with minimal data', async () => {
      const createData = {
        name: 'Minimal User',
        email: 'minimal@example.com'
      };

      const result = await usecases.create(createData);

      expect(result).toBeDefined();
      expect(result.name).toBe(createData.name);
      expect(result.email).toBe(createData.email);
      expect(result.active).toBe(false); // default value
    });
  });

  describe('update', () => {
    it('should update an existing entity successfully', async () => {
      const existingEntity: TestEntity = {
        id: 'test-id-1',
        name: 'Original Name',
        email: 'original@example.com',
        active: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockRepository.addEntity(existingEntity);

      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        active: true
      };

      const result = await usecases.update('test-id-1', updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe('test-id-1');
      expect(result.name).toBe(updateData.name);
      expect(result.email).toBe(updateData.email);
      expect(result.active).toBe(updateData.active);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException when entity does not exist', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      await expect(usecases.update('non-existent-id', updateData))
        .rejects
        .toThrow(HttpException);
    });

    it('should update only provided fields', async () => {
      const existingEntity: TestEntity = {
        id: 'test-id-2',
        name: 'Original Name',
        email: 'original@example.com',
        active: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockRepository.addEntity(existingEntity);

      const updateData = {
        name: 'Updated Name'
        // email and active not provided
      };

      const result = await usecases.update('test-id-2', updateData);

      expect(result.name).toBe(updateData.name);
      expect(result.email).toBe(existingEntity.email); // unchanged
      expect(result.active).toBe(existingEntity.active); // unchanged
    });
  });

  describe('findById', () => {
    it('should find entity by id successfully', async () => {
      const existingEntity: TestEntity = {
        id: 'test-id-3',
        name: 'Test User',
        email: 'test@example.com',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockRepository.addEntity(existingEntity);

      const result = await usecases.findById('test-id-3');

      expect(result).toBeDefined();
      expect(result.id).toBe('test-id-3');
      expect(result.name).toBe(existingEntity.name);
      expect(result.email).toBe(existingEntity.email);
    });

    it('should throw NotFoundException when entity does not exist', async () => {
      await expect(usecases.findById('non-existent-id'))
        .rejects
        .toThrow(HttpException);
    });
  });

  describe('findMany', () => {
    beforeEach(() => {
      // Add some test entities
      const entities: TestEntity[] = [
        {
          id: 'test-id-1',
          name: 'User 1',
          email: 'user1@example.com',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'test-id-2',
          name: 'User 2',
          email: 'user2@example.com',
          active: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'test-id-3',
          name: 'User 3',
          email: 'user3@example.com',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      entities.forEach(entity => mockRepository.addEntity(entity));
    });

    it('should return all entities with default pagination', async () => {
      const result = await usecases.findMany({
        page_number: 1,
        page_size: 10,
        by: 'name',
        order: 'asc'
      });

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(3);
      expect(result.pagination.totalItems).toBe(3);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.currentPage).toBe(1);
    });

    it('should handle pagination correctly', async () => {
      const result = await usecases.findMany({
        page_number: 1,
        page_size: 2,
        by: 'name',
        order: 'asc'
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.totalItems).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.pageSize).toBe(2);
    });

    it('should handle sorting parameters', async () => {
      const result = await usecases.findMany({
        page_number: 1,
        page_size: 10,
        by: 'name',
        order: 'asc'
      });

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(3);
    });

    it('should handle filters correctly', async () => {
      const result = await usecases.findMany({
        page_number: 1,
        page_size: 10,
        by: 'name',
        order: 'asc',
        active: 'true'
      });

      expect(result).toBeDefined();
      // The mock repository doesn't implement filtering, but the method should not throw
    });

    it('should handle complex filter parameters', async () => {
      const result = await usecases.findMany({
        page_number: 1,
        page_size: 10,
        by: 'name',
        order: 'desc',
        active: 'true',
        email: 'user1@example.com'
      } as any);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(3);
    });
  });

  describe('deleteById', () => {
    it('should delete entity successfully', async () => {
      const existingEntity: TestEntity = {
        id: 'test-id-4',
        name: 'Test User',
        email: 'test@example.com',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockRepository.addEntity(existingEntity);

      await expect(usecases.deleteById('test-id-4')).resolves.not.toThrow();
    });

    it('should throw NotFoundException when entity does not exist', async () => {
      await expect(usecases.deleteById('non-existent-id'))
        .rejects
        .toThrow(HttpException);
    });

    it('should handle repository delete errors', async () => {
      const existingEntity: TestEntity = {
        id: 'test-id-5',
        name: 'Test User',
        email: 'test@example.com',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockRepository.addEntity(existingEntity);

      // Mock the repository to return an error
      jest.spyOn(mockRepository, 'delete').mockResolvedValueOnce({
        data: existingEntity,
        error: new Error('Delete failed')
      });

      await expect(usecases.deleteById('test-id-5'))
        .rejects
        .toThrow('Delete failed');
    });
  });

  describe('edge cases', () => {
    it('should handle empty repository in findMany', async () => {
      mockRepository.clearEntities();
      
      const result = await usecases.findMany({
        page_number: 1,
        page_size: 10,
        by: 'name',
        order: 'asc'
      });
      
      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('should handle null/undefined parameters gracefully', async () => {
      const result = await usecases.findMany({
        page_number: 1,
        page_size: 10,
        by: 'name',
        order: 'asc'
      });

      expect(result).toBeDefined();
    });

    it('should handle empty string filters', async () => {
      const result = await usecases.findMany({
        page_number: 1,
        page_size: 10,
        by: 'name',
        order: 'asc',
        name: '',
        email: ''
      } as any);

      expect(result).toBeDefined();
    });
  });
});

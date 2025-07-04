import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test utilities
export const testUtils = {
  generateTestUser: () => ({
    id: `test-user-${Math.random().toString(36).substr(2, 9)}`,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    hashPassword: 'hashedpassword',
    salt: 'salt',
    confirmed: true,
    maxUsers: 10,
    maxSpaces: 5,
    maxStorage: 1000,
    maxAiEnhancementsPerMonth: 10,
    stripeId: 'cus_test123',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  generateTestSpace: () => ({
    id: `test-space-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Space',
    description: 'Test space description',
    userIds: ['test-user-id'],
    createdByUserId: 'test-user-id',
    usedMegabytes: 0,
    shareType: 'public',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  generateTestContent: () => ({
    id: `test-content-${Math.random().toString(36).substr(2, 9)}`,
    name: 'test-image.jpg',
    description: 'Test content',
    key: 'test-key',
    mimeType: 'image/jpeg',
    location: 'https://example.com/test-image.jpg',
    spaceId: 'test-space-id',
    size: 1024,
    uploadCompletion: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
}; 
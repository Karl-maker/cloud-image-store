import request from 'supertest';
import { TestServer } from '../test.server';
import { testUtils } from '../setup';
import { JwtTokenService } from '../../application/services/token/jwt.token.service';
import { TOKEN_SECRET } from '../../application/configuration';

describe('User E2E Tests', () => {
    let server: TestServer;
    let app: any;
    let jwtService: JwtTokenService<any>;

    beforeAll(() => {
        server = new TestServer();
        app = server.getServer();
        jwtService = new JwtTokenService();
    });

    beforeEach(() => {
        server.clearAllData();
    });

    afterAll(() => {
        // Clean up
    });

    describe('User Registration', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/v1/user/register')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('accessToken');
            expect(response.body.accessToken).toBeDefined();

            // Verify user was created in mock repository
            const users = await server.mockUserRepository.findMany();
            expect(users.data).toHaveLength(1);
            expect(users.data[0].email).toBe(userData.email);
            expect(users.data[0].firstName).toBe(userData.firstName);
            expect(users.data[0].lastName).toBe(userData.lastName);
        });

        it('should fail registration with invalid email', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'invalid-email',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/v1/user/register')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        it('should fail registration with weak password', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: '123'
            };

            const response = await request(app)
                .post('/api/v1/user/register')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        it('should fail registration with duplicate email', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123'
            };

            // Register first user
            await request(app)
                .post('/api/v1/user/register')
                .send(userData)
                .expect(201);

            // Try to register with same email
            const response = await request(app)
                .post('/api/v1/user/register')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('User Login', () => {
        let registeredUser: any;
        let accessToken: string;

        beforeEach(async () => {
            // Register a user first
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123'
            };

            const registerResponse = await request(app)
                .post('/api/v1/user/register')
                .send(userData);

            registeredUser = (await server.mockUserRepository.findMany()).data[0];
            accessToken = registerResponse.body.accessToken;
        });

        it('should login successfully with correct credentials', async () => {
            const loginData = {
                email: 'john.doe@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/v1/user/login')
                .send(loginData)
                .expect(200);

            expect(response.body).toHaveProperty('accessToken');
            expect(response.body.accessToken).toBeDefined();
        });

        it('should fail login with incorrect password', async () => {
            const loginData = {
                email: 'john.doe@example.com',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/api/v1/user/login')
                .send(loginData)
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });

        it('should fail login with non-existent email', async () => {
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/v1/user/login')
                .send(loginData)
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('User Profile Management', () => {
        let accessToken: string;
        let userId: string;

        beforeEach(async () => {
            // Register and login a user
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123'
            };

            const registerResponse = await request(app)
                .post('/api/v1/user/register')
                .send(userData);

            accessToken = registerResponse.body.accessToken;
            const user = (await server.mockUserRepository.findMany()).data[0];
            userId = user.id!;
        });

        it('should get user profile successfully', async () => {
            const response = await request(app)
                .get('/api/v1/user/profile')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('email');
            expect(response.body).toHaveProperty('firstName');
            expect(response.body).toHaveProperty('lastName');
            expect(response.body.email).toBe('john.doe@example.com');
        });

        it('should fail to get profile without authentication', async () => {
            const response = await request(app)
                .get('/api/v1/user/profile')
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });

        it('should update user profile successfully', async () => {
            const updateData = {
                firstName: 'Jane',
                lastName: 'Smith'
            };

            const response = await request(app)
                .put('/api/v1/user/profile')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.firstName).toBe('Jane');
            expect(response.body.lastName).toBe('Smith');

            // Verify update in repository
            const updatedUser = await server.mockUserRepository.findById(userId);
            expect(updatedUser?.firstName).toBe('Jane');
            expect(updatedUser?.lastName).toBe('Smith');
        });

        it('should fail to update profile without authentication', async () => {
            const updateData = {
                firstName: 'Jane',
                lastName: 'Smith'
            };

            const response = await request(app)
                .put('/api/v1/user/profile')
                .send(updateData)
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('Email Confirmation', () => {
        let accessToken: string;
        let userId: string;

        beforeEach(async () => {
            // Register a user
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123'
            };

            const registerResponse = await request(app)
                .post('/api/v1/user/register')
                .send(userData);

            accessToken = registerResponse.body.accessToken;
            const user = (await server.mockUserRepository.findMany()).data[0];
            userId = user.id!;
        });

        it('should send confirmation email successfully', async () => {
            const response = await request(app)
                .post('/api/v1/user/send-confirmation')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(201);

            // Verify email was sent
            const sentEmails = server.mockEmailService.getSentEmails();
            expect(sentEmails).toHaveLength(1);
            expect(sentEmails[0].to).toBe('john.doe@example.com');
            expect(sentEmails[0].template).toBe('confirmation');
        });

        it('should fail to send confirmation email without authentication', async () => {
            const response = await request(app)
                .post('/api/v1/user/send-confirmation')
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('Password Recovery', () => {
        beforeEach(async () => {
            // Register a user
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123'
            };

            await request(app)
                .post('/api/v1/user/register')
                .send(userData);
        });

        it('should send recovery email successfully', async () => {
            const recoveryData = {
                email: 'john.doe@example.com'
            };

            const response = await request(app)
                .post('/api/v1/user/recover')
                .send(recoveryData)
                .expect(201);

            // Verify recovery email was sent
            const sentEmails = server.mockEmailService.getSentEmails();
            expect(sentEmails).toHaveLength(1);
            expect(sentEmails[0].to).toBe('john.doe@example.com');
            expect(sentEmails[0].template).toBe('recovery');
        });

        it('should fail recovery with non-existent email', async () => {
            const recoveryData = {
                email: 'nonexistent@example.com'
            };

            const response = await request(app)
                .post('/api/v1/user/recover')
                .send(recoveryData)
                .expect(404);

            expect(response.body).toHaveProperty('message');
        });

        it('should fail recovery with invalid email format', async () => {
            const recoveryData = {
                email: 'invalid-email'
            };

            const response = await request(app)
                .post('/api/v1/user/recover')
                .send(recoveryData)
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('User Confirmation', () => {
        let confirmationToken: string;

        beforeEach(async () => {
            // Register a user and get confirmation token
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123'
            };

            await request(app)
                .post('/api/v1/user/register')
                .send(userData);

            // Generate confirmation token manually for testing
            const user = (await server.mockUserRepository.findMany()).data[0];
            confirmationToken = await jwtService.generate(
                { userId: user.id },
                'test-confirmation-secret',
                {
                    issuer: 'confirmation',
                    exp: Math.floor(Date.now() / 1000) + (15 * 60),
                    audience: 'cloud-photo-share'
                }
            );
        });

        it('should confirm user successfully with valid token', async () => {
            const confirmData = {
                token: confirmationToken
            };

            const response = await request(app)
                .post('/api/v1/user/verify-confirmation')
                .send(confirmData)
                .expect(201);

            // Verify user is confirmed
            const users = await server.mockUserRepository.findMany();
            expect(users.data[0].confirmed).toBe(true);
        });

        it('should fail confirmation with invalid token', async () => {
            const confirmData = {
                token: 'invalid-token'
            };

            const response = await request(app)
                .post('/api/v1/user/verify-confirmation')
                .send(confirmData)
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });

        it('should fail confirmation with missing token', async () => {
            const confirmData = {};

            const response = await request(app)
                .post('/api/v1/user/verify-confirmation')
                .send(confirmData)
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('User Search and Pagination', () => {
        beforeEach(async () => {
            // Register multiple users
            const users = [
                { firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'password123' },
                { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', password: 'password123' },
                { firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', password: 'password123' }
            ];

            for (const userData of users) {
                await request(app)
                    .post('/api/v1/user/register')
                    .send(userData);
            }
        });

        it('should return paginated users', async () => {
            const response = await request(app)
                .get('/api/v1/user')
                .query({ page: 1, limit: 2 })
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('pagination');
            expect(response.body.data).toHaveLength(2);
            expect(response.body.pagination.total).toBe(3);
        });

        it('should filter users by email', async () => {
            const response = await request(app)
                .get('/api/v1/user')
                .query({ 'filters[email][exact]': 'john@example.com' })
                .expect(200);

            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].email).toBe('john@example.com');
        });

        it('should sort users by firstName', async () => {
            const response = await request(app)
                .get('/api/v1/user')
                .query({ 'sort[firstName]': 'asc' })
                .expect(200);

            expect(response.body.data[0].firstName).toBe('Bob');
            expect(response.body.data[1].firstName).toBe('Jane');
            expect(response.body.data[2].firstName).toBe('John');
        });
    });
}); 
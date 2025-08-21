import { StripeUsecase } from '../../domain/usecases/stripe.usecase';
import { SpaceUsecase } from '../../domain/usecases/space.usecase';
import { UserUsecase } from '../../domain/usecases/user.usecase';
import { EventBus } from '../../infrastructure/event/event.bus';
import { Subscription } from '../../domain/entities/subscription';
import { SubscriptionPlan } from '../../domain/entities/subscription.plan';
import { User } from '../../domain/entities/user';
import { NotFoundException } from '../../application/exceptions/not.found';
import { ForbiddenException } from '../../application/exceptions/forbidden.exception';
import { PaymentCustomerService } from '../../application/services/payment/interface.payment.customer.service';
import { PaymentLinkService } from '../../application/services/payment/interface.payment.link.service';
import { SubscriptionPlanService } from '../../application/services/payment/interface.subscription.plan.service';
import { SubscriptionService } from '../../application/services/payment/interface.subscription.service';
import { BillingPortalService } from '../../application/services/payment/interface.billing.portal.service';
import { SendEmail } from '../../application/services/send-email/nodemailer.email.service';
import { USER_SUBSCRIBED_TO_PLAN } from '../../domain/constants/event.names';
import Stripe from 'stripe';

// Mock external dependencies
jest.mock('../../application/services/payment/stripe.subscription.service');
jest.mock('../../application/services/payment/stripe.payment.link.service');
jest.mock('../../application/services/payment/stripe.subscription.plan.service');
jest.mock('../../application/services/payment/stripe.payment.customer.service');
jest.mock('../../application/services/payment/stripe.billing.portal.service');
jest.mock('../../application/services/send-email/nodemailer.email.service');

// Mock configuration constants
jest.mock('../../application/configuration', () => ({
  COMPANY_DOMAIN: 'https://test.com',
  EMAIL_NO_REPLY_USER: 'noreply@test.com',
  EMAIL_NO_REPLY_SERVICE: 'gmail',
  EMAIL_NO_REPLY_PASS: 'test-password'
}));

jest.mock('../../domain/constants/client.routes', () => ({
  SUPPORT_LINK_PATH: '/support'
}));

// Mock service implementations
class MockSubscriptionService implements SubscriptionService {
  createSubscription = jest.fn();
  pauseSubscription = jest.fn();
  cancelRenewal = jest.fn();
  resumeSubscription = jest.fn();
  cancelSubscription = jest.fn();
  upgradeSubscription = jest.fn();
  downgradeSubscription = jest.fn();
  findById = jest.fn();

  constructor() {
    this.createSubscription.mockResolvedValue({
      id: 'sub_test123',
      customerId: 'cus_test123',
      planId: 'plan_test123',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.resumeSubscription.mockResolvedValue({
      id: 'sub_test123',
      customerId: 'cus_test123',
      planId: 'plan_test123',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.cancelSubscription.mockResolvedValue(1000);

    this.upgradeSubscription.mockResolvedValue({
      id: 'sub_test123',
      customerId: 'cus_test123',
      planId: 'plan_test456',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.downgradeSubscription.mockResolvedValue({
      id: 'sub_test123',
      customerId: 'cus_test123',
      planId: 'plan_test789',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.findById.mockImplementation((id: string) => {
      if (id === 'sub_test123') {
        return Promise.resolve({
          id: 'sub_test123',
          customerId: 'cus_test123',
          planId: 'plan_test123',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          autoRenew: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      return Promise.resolve(null);
    });
  }
}

class MockPaymentLinkService implements PaymentLinkService {
  generateLink = jest.fn();
  
  constructor() {
    this.generateLink.mockResolvedValue('https://checkout.stripe.com/pay/test_link_price_test123');
  }
}

class MockSubscriptionPlanService implements SubscriptionPlanService {
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  findById = jest.fn();
  findMany = jest.fn();

  constructor() {
    this.create.mockResolvedValue('plan_test123');
    
    this.findById.mockImplementation((planId: string) => {
      if (planId === 'plan_test123') {
        return Promise.resolve({
          id: 'plan_test123',
          name: 'Test Plan',
          description: 'Test plan description',
          megabytes: 1000,
          users: 5,
          spaces: 10,
          aiGenerationsPerMonth: 50,
          prices: [],
          features: [],
          highlighted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      return Promise.resolve(null);
    });

    this.findMany.mockResolvedValue([
      {
        id: 'plan_test123',
        name: 'Test Plan',
        description: 'Test plan description',
        megabytes: 1000,
        users: 5,
        spaces: 10,
        aiGenerationsPerMonth: 50,
        prices: [],
        features: [],
        highlighted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  }
}

class MockPaymentCustomerService implements PaymentCustomerService {
  create = jest.fn();
  delete = jest.fn();
  update = jest.fn();
  findById = jest.fn();

  constructor() {
    this.create.mockResolvedValue('cus_test123');
    
    this.findById.mockImplementation((customerId: string) => {
      if (customerId === 'cus_test123') {
        return Promise.resolve({
          id: 'cus_test123',
          name: 'Test Customer',
          email: 'test@example.com',
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      return Promise.resolve(null);
    });
  }
}

class MockBillingPortalService implements BillingPortalService {
  generateLink = jest.fn();
  
  constructor() {
    this.generateLink.mockResolvedValue('https://billing.stripe.com/session/test_cus_test123');
  }
}

describe('StripeUsecase', () => {
  let stripeUsecase: StripeUsecase;
  let mockStripe: any;
  let mockSpaceUsecase: jest.Mocked<SpaceUsecase>;
  let mockUserUsecase: jest.Mocked<UserUsecase>;
  let mockEventBus: jest.Mocked<EventBus>;
  let mockSubscriptionService: MockSubscriptionService;
  let mockPaymentLinkService: MockPaymentLinkService;
  let mockSubscriptionPlanService: MockSubscriptionPlanService;
  let mockPaymentCustomerService: MockPaymentCustomerService;
  let mockBillingPortalService: MockBillingPortalService;

  beforeEach(() => {
    // Create mock instances
    mockStripe = {
      checkout: {
        sessions: {
          retrieve: jest.fn().mockResolvedValue({
            id: 'cs_test123',
            line_items: {
              data: [{
                price: {
                  id: 'price_test123',
                  product: {
                    id: 'plan_test123'
                  }
                }
              }]
            }
          }),
          create: jest.fn()
        }
      },
      billingPortal: {
        sessions: {
          create: jest.fn().mockResolvedValue({
            url: 'https://billing.stripe.com/session/test'
          })
        }
      }
    };

    mockSpaceUsecase = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
      findMany: jest.fn(),
      generateAccessToken: jest.fn(),
      verifyAccessToken: jest.fn()
    } as any;

    mockUserUsecase = {
      findById: jest.fn(),
      subscribedToPlan: jest.fn(),
      subscriptionEnd: jest.fn(),
      subscriptionPaused: jest.fn(),
      subscriptionResumed: jest.fn(),
      receiveProduct: jest.fn(),
      getSystemUsage: jest.fn()
    } as any;

    mockEventBus = {
      emit: jest.fn()
    } as any;

    mockSubscriptionService = new MockSubscriptionService();
    mockPaymentLinkService = new MockPaymentLinkService();
    mockSubscriptionPlanService = new MockSubscriptionPlanService();
    mockPaymentCustomerService = new MockPaymentCustomerService();
    mockBillingPortalService = new MockBillingPortalService();

    // Mock SendEmail
    jest.spyOn(SendEmail.prototype, 'send').mockResolvedValue(undefined);

    // Create StripeUsecase instance with mocked dependencies
    stripeUsecase = new StripeUsecase(mockStripe, mockSpaceUsecase, mockUserUsecase);

    // Replace the internal services with our mocks
    (stripeUsecase as any).subscriptionService = mockSubscriptionService;
    (stripeUsecase as any).paymentLinkService = mockPaymentLinkService;
    (stripeUsecase as any).subscriptionPlanService = mockSubscriptionPlanService;
    (stripeUsecase as any).paymentCustomerService = mockPaymentCustomerService;
    (stripeUsecase as any).billingPortalService = mockBillingPortalService;

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('createPaymentLink', () => {
    it('should create payment link successfully', async () => {
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
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserUsecase.findById.mockResolvedValue(mockUser);

      const result = await stripeUsecase.createPaymentLink('price_test123', 'user-1', 'space-1');

      expect(result).toBe('https://checkout.stripe.com/pay/test_link_price_test123');
      expect(mockUserUsecase.findById).toHaveBeenCalledWith('user-1');
      expect(mockPaymentLinkService.generateLink).toHaveBeenCalledWith(
        'price_test123',
        'cus_test123',
        'space-1'
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserUsecase.findById.mockResolvedValue(null as any);

      await expect(stripeUsecase.createPaymentLink('price_test123', 'user-1'))
        .rejects
        .toThrow('no user found');
    });

    it('should throw ForbiddenException when user already has subscription', async () => {
      const mockUser: User = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        hashPassword: 'hash',
        salt: 'salt',
        confirmed: true,
        stripeId: 'cus_test123',
        subscriptionStripeId: 'sub_test123',
        createdAt: new Date(),
        updatedAt: new Date(),
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserUsecase.findById.mockResolvedValue(mockUser);

      await expect(stripeUsecase.createPaymentLink('price_test123', 'user-1'))
        .rejects
        .toThrow('already has subscription');
    });

    it('should throw NotFoundException when user has no stripe customer id', async () => {
      const mockUser: User = {
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

      mockUserUsecase.findById.mockResolvedValue(mockUser);

      await expect(stripeUsecase.createPaymentLink('price_test123', 'user-1'))
        .rejects
        .toThrow('no customer stripe id found');
    });
  });

  describe('billingPortalLink', () => {
    it('should generate billing portal link successfully', async () => {
      const result = await stripeUsecase.billingPortalLink('cus_test123');

      expect(result).toBe('https://billing.stripe.com/session/test_cus_test123');
      expect(mockBillingPortalService.generateLink).toHaveBeenCalledWith('cus_test123');
    });
  });

  describe('createSubscriptionPlan', () => {
    it('should create subscription plan successfully', async () => {
      const plan: SubscriptionPlan = {
        id: 'plan_test123',
        name: 'Test Plan',
        description: 'Test plan description',
        megabytes: 1000,
        users: 5,
        spaces: 10,
        aiGenerationsPerMonth: 50,
        prices: [],
        features: [],
        highlighted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await stripeUsecase.createSubscriptionPlan(plan);

      expect(result).toBe('plan_test123');
      expect(mockSubscriptionPlanService.create).toHaveBeenCalledWith(plan);
    });
  });

  describe('subscription management', () => {
    it('should cancel subscription renewal', async () => {
      await stripeUsecase.cancelSubscriptionRenewal('sub_test123');

      expect(mockSubscriptionService.cancelRenewal).toHaveBeenCalledWith('sub_test123');
    });

    it('should cancel subscription immediately', async () => {
      await stripeUsecase.cancelSubscriptionImmediately('sub_test123');

      expect(mockSubscriptionService.cancelSubscription).toHaveBeenCalledWith('sub_test123');
    });

    it('should upgrade subscription', async () => {
      const mockSubscription: Subscription = {
        id: 'sub_test123',
        customerId: 'cus_test123',
        planId: 'plan_test456',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockSubscriptionService.upgradeSubscription.mockResolvedValue(mockSubscription);

      const result = await stripeUsecase.upgradeSubscription('sub_test123', 'plan_test456');

      expect(result).toEqual(mockSubscription);
      expect(mockSubscriptionService.upgradeSubscription).toHaveBeenCalledWith('sub_test123', 'plan_test456');
    });

    it('should downgrade subscription', async () => {
      const mockSubscription: Subscription = {
        id: 'sub_test123',
        customerId: 'cus_test123',
        planId: 'plan_test789',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockSubscriptionService.downgradeSubscription.mockResolvedValue(mockSubscription);

      const result = await stripeUsecase.downgradeSubscription('sub_test123', 'plan_test789');

      expect(result).toEqual(mockSubscription);
      expect(mockSubscriptionService.downgradeSubscription).toHaveBeenCalledWith('sub_test123', 'plan_test789');
    });

    it('should pause subscription', async () => {
      await stripeUsecase.pauseSubscription('sub_test123');

      expect(mockSubscriptionService.pauseSubscription).toHaveBeenCalledWith('sub_test123');
    });

    it('should resume subscription', async () => {
      await stripeUsecase.resumeSubscription('sub_test123');

      expect(mockSubscriptionService.resumeSubscription).toHaveBeenCalledWith('sub_test123');
    });
  });

  describe('findAllSubscriptionPlans', () => {
    it('should return all subscription plans', async () => {
      const result = await stripeUsecase.findAllSubscriptionPlans();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('plan_test123');
      expect(mockSubscriptionPlanService.findMany).toHaveBeenCalled();
    });
  });

  describe('createPaymentCustomer', () => {
    it('should create payment customer successfully', async () => {
      const result = await stripeUsecase.createPaymentCustomer('John Doe', 'john@example.com');

      expect(result).toBe('cus_test123');
      expect(mockPaymentCustomerService.create).toHaveBeenCalledWith('John Doe', 'john@example.com');
    });
  });

  describe('webhook - simplified tests', () => {
    it('should handle customer.subscription.created event', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123'
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

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
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserUsecase.subscribedToPlan.mockResolvedValue(mockUser);

      await stripeUsecase.webhook(event, mockEventBus);

      expect(mockUserUsecase.subscribedToPlan).toHaveBeenCalledWith(
        'cus_test123',
        expect.objectContaining({ id: 'sub_test123' }),
        expect.objectContaining({ id: 'plan_test123' })
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith(USER_SUBSCRIBED_TO_PLAN, {
        plan: expect.objectContaining({ id: 'plan_test123' }),
        user: mockUser
      });
    });

    it('should handle payment_intent.succeeded event', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            customer: 'cus_test123',
            metadata: {
              product_id: 'plan_test123'
            }
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

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
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserUsecase.findById.mockResolvedValue(mockUser);
      mockUserUsecase.receiveProduct.mockResolvedValue(mockUser);

      await stripeUsecase.webhook(event, mockEventBus);

      expect(mockUserUsecase.findById).toHaveBeenCalledWith('cus_test123');
      expect(mockUserUsecase.receiveProduct).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'plan_test123' }),
        mockUser
      );
    });

    it('should handle customer.subscription.deleted event', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123'
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

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
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserUsecase.subscriptionEnd.mockResolvedValue(mockUser);

      await stripeUsecase.webhook(event, mockEventBus);

      expect(mockUserUsecase.subscriptionEnd).toHaveBeenCalledWith('cus_test123');
    });

    it('should handle invoice.payment_failed event', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_test123',
            customer: 'cus_test123',
            amount_due: 1000,
            next_payment_attempt: Math.floor(Date.now() / 1000) + 24 * 60 * 60
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

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
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserUsecase.findById.mockResolvedValue(mockUser);

      await stripeUsecase.webhook(event, mockEventBus);

      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_test123',
        return_url: 'https://test.com'
      });
      expect(mockUserUsecase.findById).toHaveBeenCalledWith('cus_test123');
    });

    it('should handle customer.subscription.paused event', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'customer.subscription.paused',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123'
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

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
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserUsecase.subscriptionPaused.mockResolvedValue(mockUser);

      await stripeUsecase.webhook(event, mockEventBus);

      expect(mockUserUsecase.subscriptionPaused).toHaveBeenCalledWith('cus_test123');
    });

    it('should handle customer.subscription.resumed event', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'customer.subscription.resumed',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123'
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

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
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserUsecase.subscriptionResumed.mockResolvedValue(mockUser);

      await stripeUsecase.webhook(event, mockEventBus);

      expect(mockUserUsecase.subscriptionResumed).toHaveBeenCalledWith('cus_test123');
    });

    it('should handle customer.subscription.updated with plan change', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123',
            status: 'active',
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
            items: {
              data: [{
                plan: {
                  product: 'plan_test123'
                }
              }]
            }
          },
          previous_attributes: {
            plan: {
              id: 'old_plan_id'
            }
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

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
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserUsecase.subscribedToPlan.mockResolvedValue(mockUser);

      await stripeUsecase.webhook(event, mockEventBus);

      expect(mockUserUsecase.subscribedToPlan).toHaveBeenCalledWith(
        'cus_test123',
        expect.objectContaining({ id: 'sub_test123' }),
        expect.objectContaining({ id: 'plan_test123' })
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith(USER_SUBSCRIBED_TO_PLAN, {
        plan: expect.objectContaining({ id: 'plan_test123' }),
        user: mockUser
      });
    });

    it('should handle customer.subscription.updated with cancellation at period end', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123',
            status: 'active',
            cancel_at_period_end: true,
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
          },
          previous_attributes: {
            cancel_at_period_end: false
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

      await stripeUsecase.webhook(event, mockEventBus);

      // Should not call subscriptionEnd yet, just log
      expect(mockUserUsecase.subscriptionEnd).not.toHaveBeenCalled();
    });

    it('should handle customer.subscription.updated with natural end', async () => {
      const pastTime = Math.floor(Date.now() / 1000) - 24 * 60 * 60; // 1 day ago
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123',
            status: 'canceled',
            current_period_end: pastTime
          },
          previous_attributes: {}
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

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
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserUsecase.subscriptionEnd.mockResolvedValue(mockUser);

      await stripeUsecase.webhook(event, mockEventBus);

      expect(mockUserUsecase.subscriptionEnd).toHaveBeenCalledWith('cus_test123');
    });

    it('should handle payment_intent.succeeded with session retrieval', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            customer: 'cus_test123',
            metadata: {
              session_id: 'cs_test123'
            }
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

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
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserUsecase.findById.mockResolvedValue(mockUser);
      mockUserUsecase.receiveProduct.mockResolvedValue(mockUser);

      await stripeUsecase.webhook(event, mockEventBus);

      expect(mockStripe.checkout.sessions.retrieve).toHaveBeenCalledWith(
        'cs_test123',
        { expand: ['line_items.data.price.product'] }
      );
      expect(mockUserUsecase.receiveProduct).toHaveBeenCalled();
    });

    it('should handle payment_intent.succeeded with subscription invoice', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            customer: 'cus_test123',
            invoice: 'in_test123',
            metadata: {}
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

      await stripeUsecase.webhook(event, mockEventBus);

      // Should not process subscription payments in payment_intent.succeeded
      expect(mockUserUsecase.receiveProduct).not.toHaveBeenCalled();
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle unknown webhook event types gracefully', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'unknown.event.type',
        data: {
          object: {}
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

      // Should not throw error for unknown event types
      await expect(stripeUsecase.webhook(event, mockEventBus)).resolves.not.toThrow();
    });

    it('should handle service errors gracefully', async () => {
      // Test that service errors are properly propagated
      mockSubscriptionService.findById.mockRejectedValue(new Error('Service error'));

      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123'
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

      await expect(stripeUsecase.webhook(event, mockEventBus))
        .rejects
        .toThrow('Service error');
    });

    it('should handle null/undefined responses from services', async () => {
      mockSubscriptionService.findById.mockResolvedValue(null);

      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123'
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

      await expect(stripeUsecase.webhook(event, mockEventBus))
        .rejects
        .toThrow('no subscription found');
    });

    it('should handle payment link service errors', async () => {
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
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserUsecase.findById.mockResolvedValue(mockUser);
      mockPaymentLinkService.generateLink.mockRejectedValue(new Error('Payment link generation failed'));

      await expect(stripeUsecase.createPaymentLink('price_test123', 'user-1'))
        .rejects
        .toThrow('Payment link generation failed');
    });

    it('should handle billing portal service errors', async () => {
      mockBillingPortalService.generateLink.mockRejectedValue(new Error('Billing portal error'));

      await expect(stripeUsecase.billingPortalLink('cus_test123'))
        .rejects
        .toThrow('Billing portal error');
    });

    it('should handle subscription plan creation errors', async () => {
      const plan: SubscriptionPlan = {
        id: 'plan_test123',
        name: 'Test Plan',
        description: 'Test plan description',
        megabytes: 1000,
        users: 5,
        spaces: 10,
        aiGenerationsPerMonth: 50,
        prices: [],
        features: [],
        highlighted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockSubscriptionPlanService.create.mockRejectedValue(new Error('Plan creation failed'));

      await expect(stripeUsecase.createSubscriptionPlan(plan))
        .rejects
        .toThrow('Plan creation failed');
    });

    it('should handle subscription management errors', async () => {
      mockSubscriptionService.cancelRenewal.mockRejectedValue(new Error('Cancel renewal failed'));
      mockSubscriptionService.cancelSubscription.mockRejectedValue(new Error('Cancel subscription failed'));
      mockSubscriptionService.upgradeSubscription.mockRejectedValue(new Error('Upgrade failed'));
      mockSubscriptionService.downgradeSubscription.mockRejectedValue(new Error('Downgrade failed'));
      mockSubscriptionService.pauseSubscription.mockRejectedValue(new Error('Pause failed'));
      mockSubscriptionService.resumeSubscription.mockRejectedValue(new Error('Resume failed'));

      await expect(stripeUsecase.cancelSubscriptionRenewal('sub_test123'))
        .rejects
        .toThrow('Cancel renewal failed');

      await expect(stripeUsecase.cancelSubscriptionImmediately('sub_test123'))
        .rejects
        .toThrow('Cancel subscription failed');

      await expect(stripeUsecase.upgradeSubscription('sub_test123', 'plan_test456'))
        .rejects
        .toThrow('Upgrade failed');

      await expect(stripeUsecase.downgradeSubscription('sub_test123', 'plan_test789'))
        .rejects
        .toThrow('Downgrade failed');

      await expect(stripeUsecase.pauseSubscription('sub_test123'))
        .rejects
        .toThrow('Pause failed');

      await expect(stripeUsecase.resumeSubscription('sub_test123'))
        .rejects
        .toThrow('Resume failed');
    });

    it('should handle customer creation errors', async () => {
      mockPaymentCustomerService.create.mockRejectedValue(new Error('Customer creation failed'));

      await expect(stripeUsecase.createPaymentCustomer('John Doe', 'john@example.com'))
        .rejects
        .toThrow('Customer creation failed');
    });

    it('should handle webhook with missing event data', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'customer.subscription.created',
        data: null,
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

      // Should throw error due to missing data
      await expect(stripeUsecase.webhook(event, mockEventBus))
        .rejects
        .toThrow();
    });

    it('should handle webhook with malformed event data', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'customer.subscription.created',
        data: {
          object: null
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

      // Should throw error due to malformed data
      await expect(stripeUsecase.webhook(event, mockEventBus))
        .rejects
        .toThrow();
    });

    it('should handle payment intent with missing metadata', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            customer: 'cus_test123',
            metadata: null
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

      // Should throw error due to missing product
      await expect(stripeUsecase.webhook(event, mockEventBus))
        .rejects
        .toThrow('no product found');
    });

    it('should handle payment intent with missing customer', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            customer: null,
            metadata: {
              product_id: 'plan_test123'
            }
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

      // Should throw error due to missing customer
      await expect(stripeUsecase.webhook(event, mockEventBus))
        .rejects
        .toThrow('no user found');
    });

    it('should handle subscription update with missing previous attributes', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123',
            status: 'active',
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
            items: {
              data: [{
                plan: {
                  product: 'plan_test123'
                }
              }]
            }
          },
          previous_attributes: null
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

      // Should handle gracefully
      await expect(stripeUsecase.webhook(event, mockEventBus)).resolves.not.toThrow();
    });

    it('should handle invoice payment failed with missing user', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_test123',
            customer: 'cus_nonexistent',
            amount_due: 1000,
            next_payment_attempt: Math.floor(Date.now() / 1000) + 24 * 60 * 60
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

      mockUserUsecase.findById.mockResolvedValue(null as any);

      // Should handle gracefully without throwing
      await expect(stripeUsecase.webhook(event, mockEventBus)).resolves.not.toThrow();
    });

    it('should handle email sending errors gracefully', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_test123',
            customer: 'cus_test123',
            amount_due: 1000,
            next_payment_attempt: Math.floor(Date.now() / 1000) + 24 * 60 * 60
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

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
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserUsecase.findById.mockResolvedValue(mockUser);
      jest.spyOn(SendEmail.prototype, 'send').mockRejectedValue(new Error('Email sending failed'));

      // Should handle email errors gracefully
      await expect(stripeUsecase.webhook(event, mockEventBus)).resolves.not.toThrow();
    });

    it('should handle concurrent webhook processing', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123'
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

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
        maxUsers: 0,
        maxSpaces: 0,
        maxStorage: 0,
        maxAiEnhancementsPerMonth: 0
      };

      mockUserUsecase.subscribedToPlan.mockResolvedValue(mockUser);

      // Process multiple webhooks concurrently
      const promises = [
        stripeUsecase.webhook(event, mockEventBus),
        stripeUsecase.webhook(event, mockEventBus),
        stripeUsecase.webhook(event, mockEventBus)
      ];

      await expect(Promise.all(promises)).resolves.not.toThrow();
      expect(mockUserUsecase.subscribedToPlan).toHaveBeenCalledTimes(3);
    });

    it('should handle webhook with invalid event type', async () => {
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: null,
        data: {
          object: {}
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

      // Should handle gracefully
      await expect(stripeUsecase.webhook(event, mockEventBus)).resolves.not.toThrow();
    });

    it('should handle webhook with missing event ID', async () => {
      const event: any = {
        object: 'event',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123'
          }
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

      // Should handle gracefully
      await expect(stripeUsecase.webhook(event, mockEventBus)).resolves.not.toThrow();
    });

    it('should handle webhook with future timestamp', async () => {
      const futureTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 1 day in future
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123'
          }
        },
        created: futureTime,
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

      // Should handle gracefully
      await expect(stripeUsecase.webhook(event, mockEventBus)).resolves.not.toThrow();
    });

    it('should handle webhook with very old timestamp', async () => {
      const oldTime = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60; // 1 year ago
      const event: any = {
        id: 'evt_test123',
        object: 'event',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123'
          }
        },
        created: oldTime,
        livemode: false,
        pending_webhooks: 0,
        request: null,
        api_version: '2020-08-27'
      };

      // Should handle gracefully
      await expect(stripeUsecase.webhook(event, mockEventBus)).resolves.not.toThrow();
    });
  });
});

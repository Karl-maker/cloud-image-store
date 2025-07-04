import { CreateUserDTO } from "../interfaces/presenters/dtos/create.user.dto";
import { UpdateUserDTO } from "../interfaces/presenters/dtos/update.user.dto";
import { PasswordService } from "../../application/services/password/password.service";
import { User } from "../entities/user";
import { UserFilterBy, UserSortBy } from "../types/user";
import { Usecases } from "./usecases";
import { UserRepository } from "../repositories/user.repository";
import { SendConfirmationEmailDTO } from "../interfaces/presenters/dtos/send.confirmation.email.dto";
import { JwtTokenService } from "../../application/services/token/jwt.token.service";
import { TokenServiceConfiguration } from "../types/token";
import { dateToJwtExp } from "../../utils/jwt.time.util";
import { NotFoundException } from "../../application/exceptions/not.found";
import { COMPANY_DOMAIN, CONFIRMATION_SECRET, EMAIL_NO_REPLY_PASS, EMAIL_NO_REPLY_SERVICE, EMAIL_NO_REPLY_USER, MY_DOMAIN, TOKEN_SECRET } from "../../application/configuration";
import { SendEmail } from "../../application/services/send-email/nodemailer.email.service";
import { ConfirmationEmailContent, RecoveryEmailContent } from "../types/email";
import { ConfirmationEmail } from "../entities/confirmation.email";
import { Templates } from "../constants/templates";
import { USER_PATH } from "../constants/api.routes";
import { VerifyConfirmationDTO } from "../interfaces/presenters/dtos/verify.confirmation.dto";
import { RecoverUserDTO } from "../interfaces/presenters/dtos/recover.user.dto";
import { RecoveryEmail } from "../entities/recovery.email";
import { wasMinutesAgo } from "../../utils/x.mins.ago.util";
import { ValidationException } from "../../application/exceptions/validation.exception";
import { LoginUserDTO } from "../interfaces/presenters/dtos/login.user.dto";
import { CONFIRMATION_PATH, RECOVERY_PATH } from "../constants/client.routes";
import { HttpException } from "../../application/exceptions/http.exception";
import { Subscription } from "../entities/subscription";
import { SubscriptionPlan } from "../entities/subscription.plan";
import { SystemUsageResponse } from "../interfaces/presenters/dtos/system.usage.dto";
import { SpaceRepository } from "../repositories/space.repository";

export class UserUsecase extends Usecases<User, UserSortBy, UserFilterBy, UserRepository> {
    constructor (
        repository: UserRepository,
        private spaceRepository?: SpaceRepository
    ) {
        super(repository);
    }

    async mapCreateDtoToEntity(data: CreateUserDTO): Promise<User> {

        const hashResults = await PasswordService.hash(data.password);

        const user : User = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            hashPassword: hashResults.pass,
            confirmed: false,
            id: null,
            stripeId: null,
            salt: hashResults.salt,
            createdAt: new Date(),
            updatedAt: new Date(),
            maxUsers: 0,
            maxSpaces: 0,
            maxStorage: 0,
            maxAiEnhancementsPerMonth: 0
        }

        return user;
    }
    async mapUpdateDtoToEntity(data: UpdateUserDTO, item: User): Promise<User> {
        if(data.password) {
            if(item.lastPasswordUpdate && !wasMinutesAgo(item.lastPasswordUpdate, 15)) throw new ValidationException('Cannot update password right not')
            const hashResults = await PasswordService.hash(data.password);
            delete data['password'];
            item.hashPassword = hashResults.pass;
            item.salt = hashResults.salt;
            item.lastPasswordUpdate = new Date();
        }

        const user : User = {
            ...item,
            ...data
        }

        return user;
    }
    async sendConfirmationEmail(data: SendConfirmationEmailDTO): Promise<void> {
            const user = await this.repository.findById(data.userId);

            if(!user) throw new NotFoundException('user not found');

            const config : TokenServiceConfiguration = {
                issuer: "confirmation",
                exp: (15 * 60) + dateToJwtExp(new Date()),
                audience: 'cloud-photo-share'
            }

            const secret = CONFIRMATION_SECRET!

            const confirmationToken = await new JwtTokenService().generate(
                { userId: user.id! },
                secret,
                config
            )

            const content : ConfirmationEmailContent = {
                link: `${COMPANY_DOMAIN}${CONFIRMATION_PATH}?token=` + confirmationToken,
                name: user.firstName + " " + user.lastName,
                expiresIn: "15 minutes"
            }

            const email : ConfirmationEmail = {
                template: Templates.CONFIRMATION,
                to: user.email,
                from: EMAIL_NO_REPLY_USER!,
                content,
                subject: `Confirmation <${EMAIL_NO_REPLY_USER}>`,
                id: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            await new SendEmail(
                EMAIL_NO_REPLY_SERVICE!,
                EMAIL_NO_REPLY_USER!,
                EMAIL_NO_REPLY_PASS!
            ).send(email);
    }
    async checkConfirmationToken(data: VerifyConfirmationDTO): Promise<User> {
        const secret = CONFIRMATION_SECRET!

        const payload = await new JwtTokenService<{ userId: string }>().validate(
            data.token,
            secret
        )
 
        const user = await this.repository.findById(payload.userId);
        if(!user) throw new NotFoundException('no user found');

        user.confirmed = true;

        return await this.repository.save(user);
    }
    async recover(data: RecoverUserDTO) : Promise<void> {
        const user = (await this.repository.findMany({
            filters: {
                email: {
                    exact: data.email
                }
            }
        })).data[0];

        if(!user) throw new NotFoundException('user not found');
        if(user.lastPasswordUpdate && !wasMinutesAgo(user.lastPasswordUpdate, 15)) throw new ValidationException('cannot recover right now');

        const config : TokenServiceConfiguration = {
            issuer: "recovery",
            exp: (15 * 60) + dateToJwtExp(new Date()),
            audience: 'cloud-photo-share'
        }

        const secret = TOKEN_SECRET!

        const token = await new JwtTokenService().generate(
            { id: user.id! },
            secret,
            config
        )

        const content : RecoveryEmailContent = {
            link: `${COMPANY_DOMAIN}${RECOVERY_PATH}?token=` + token,
            name: user.firstName + " " + user.lastName,
            expiresIn: "15 minutes"
        }

        const email : RecoveryEmail = {
            template: Templates.RECOVERY,
            to: user.email,
            from: EMAIL_NO_REPLY_USER!,
            content,
            subject: `Recover Password <${EMAIL_NO_REPLY_USER}>`,
            id: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await new SendEmail(
            EMAIL_NO_REPLY_SERVICE!,
            EMAIL_NO_REPLY_USER!,
            EMAIL_NO_REPLY_PASS!
        ).send(email);
    }
    async login(data: LoginUserDTO) : Promise<{
        accessToken: string;
    }> {
        const user = (await this.repository.findMany({
            filters: {
                email: {
                    exact: data.email
                }
            }
        })).data[0];

        if(!user) throw new NotFoundException('user not found');
        if(!await PasswordService.compare(data.password, user.hashPassword, user.salt)) throw new ValidationException('invalid email or password')
        
        const config : TokenServiceConfiguration = {
            issuer: "auth",
            exp: (60 * 60 * 24 * 30) + dateToJwtExp(new Date()),
            audience: 'cloud-photo-share'
        }
    
        const secret = TOKEN_SECRET!
    
        const token = await new JwtTokenService().generate(
            { id: user.id! },
            secret,
            config
        )

        return {
            accessToken: token
        }
    }
    async register (data: CreateUserDTO) : Promise<{
        accessToken: string;
        user: User;
    }> {
        const entity: User = await this.mapCreateDtoToEntity(data as CreateUserDTO)
        const saved = await this.repository.save(entity);
        if(!saved) throw new HttpException('Issue Registering', 'Issue occured', 500);

        const loginResponse = await this.login({ email: data.email, password: data.password })
        
        await this.sendConfirmationEmail({
            userId: saved.id!
        })
        return { ...loginResponse, user: saved };
    }

    async subscribedToPlan(
            stripeCustomerId: string,
            subscription: Subscription,
            subscriptionPlan: SubscriptionPlan
        ): Promise<User | NotFoundException | Error> {
    
            try {
                const mb = subscriptionPlan.megabytes;
                const maxUsers = subscriptionPlan.users;
        
                const users = await this.repository.findMany({
                    filters: {
                        stripeId: {
                            exact: stripeCustomerId
                        }
                    }
                });

                const user = users.data[0];

                if(!user) return new NotFoundException('user not found by id');
        
                user.maxStorage = mb;
                user.maxUsers = maxUsers;
                user.maxSpaces = subscriptionPlan.spaces;
                user.maxAiEnhancementsPerMonth = subscriptionPlan.aiGenerationsPerMonth ?? 0;
                user.deactivatedAt = undefined;
                user.subscriptionPlanExpiresAt = undefined;
                user.subscriptionPlanStripeId = subscriptionPlan.id ?? undefined;
                user.subscriptionStripeId = subscription.id ?? undefined;

                const saved = await this.repository.save(user);
        
                return saved;
    
            } catch(err: unknown) {
                if(err instanceof Error) return err;
                return new Error(`${err}`);
            }
    
    }

    async receiveProduct(plan: SubscriptionPlan, user: User): Promise<User | NotFoundException | Error> {
        try {
            const mb = plan.megabytes;
            const maxUsers = plan.users;
            const deactivationDate = new Date();

            deactivationDate.setDate(deactivationDate.getDate() + 90);

            user.maxStorage = mb;
            user.maxUsers = maxUsers;
            user.maxSpaces = plan.spaces;
            user.maxAiEnhancementsPerMonth = plan.aiGenerationsPerMonth ?? 0;
            user.subscriptionPlanExpiresAt = deactivationDate;
            user.subscriptionPlanStripeId = plan.id ?? undefined;
            user.subscriptionStripeId = undefined;

            const saved = await this.repository.save(user);

            return saved;
        } catch(err: unknown) {
            if(err instanceof Error) return err;
            return new Error(`${err}`);
        }
    }

    async subscriptionEnd(
            stripeCustomerId: string,
        ): Promise<User | NotFoundException | Error> {
            try {
                const users = await this.repository.findMany({
                    filters: {
                        stripeId: {
                            exact: stripeCustomerId
                        }
                    }
                });
    
                const user = users.data[0]
        
                if(!user) return new NotFoundException('user not found by id');
    
                user.subscriptionPlanExpiresAt = new Date();
    
                const saved = await this.repository.save(user);
        
                return saved;
    
            } catch(err: unknown) {
                if(err instanceof Error) return err;
                return new Error(`${err}`);
            }
    }

    async subscriptionPaused(
        stripeCustomerId: string,
        ): Promise<User | NotFoundException | Error> {
            try {
                const users = await this.repository.findMany({
                    filters: {
                        stripeId: {
                            exact: stripeCustomerId
                        }
                    }
                });
    
                const user = users.data[0]
    
                if(!user) return new NotFoundException('user not found by id');
    
                user.subscriptionPlanExpiresAt = new Date();
    
                const saved = await this.repository.save(user);
        
                return saved;
    
            } catch(err: unknown) {
                if(err instanceof Error) return err;
                return new Error(`${err}`);
            }
    }

    async subscriptionResumed(
        stripeCustomerId: string,
        ): Promise<User | NotFoundException | Error> {
            try {
                const users = await this.repository.findMany({
                    filters: {
                        stripeId: {
                            exact: stripeCustomerId
                        }
                    }
                });
    
                const user = users.data[0]
    
                if(!user) return new NotFoundException('user not found by id');
    
                user.subscriptionPlanExpiresAt = undefined;
    
                const saved = await this.repository.save(user);
        
                return saved;
    
            } catch(err: unknown) {
                if(err instanceof Error) return err;
                return new Error(`${err}`);
            }
    }

    async getSystemUsage(userId: string): Promise<SystemUsageResponse> {
        const user = await this.repository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!this.spaceRepository) {
            throw new Error('Space repository not initialized');
        }

        // Get all spaces created by this user
        const spaces = await this.spaceRepository.findMany({
            filters: {
                createdByUserId: {
                    exact: userId
                }
            }
        });

        // Calculate total storage used across all spaces
        const totalUsedMegabytes = spaces.data.reduce((total, space) => {
            return total + space.usedMegabytes;
        }, 0);

        // Calculate storage usage percentage
        const storageUsagePercentage = user.maxStorage > 0 
            ? Math.round((totalUsedMegabytes / user.maxStorage) * 100) 
            : 0;

        // Calculate spaces usage percentage
        const spacesUsagePercentage = user.maxSpaces > 0 
            ? Math.round((spaces.data.length / user.maxSpaces) * 100) 
            : 0;

        return {
            user: {
                id: user.id!,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                confirmed: user.confirmed,
                subscriptionPlanExpiresAt: user.subscriptionPlanExpiresAt
            },
            storage: {
                usedMegabytes: totalUsedMegabytes,
                maxStorage: user.maxStorage,
                usagePercentage: storageUsagePercentage
            },
            spaces: {
                totalSpaces: spaces.data.length,
                maxSpaces: user.maxSpaces,
                spacesUsagePercentage: spacesUsagePercentage
            },
            limits: {
                maxUsers: user.maxUsers,
                maxAiEnhancementsPerMonth: user.maxAiEnhancementsPerMonth
            },
            spaceDetails: spaces.data.map(space => ({
                id: space.id!,
                name: space.name,
                usedMegabytes: space.usedMegabytes,
                shareType: space.shareType,
                createdAt: space.createdAt
            }))
        };
    }
    
}
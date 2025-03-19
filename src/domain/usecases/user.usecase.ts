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

export class UserUsecase extends Usecases<User, UserSortBy, UserFilterBy, UserRepository> {
    constructor (
        repository: UserRepository,
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
            updatedAt: new Date()
        }

        return user;
    }
    async mapUpdateDtoToEntity(data: UpdateUserDTO, item: User): Promise<User> {
        if(data.password) {
            if(item.lastPasswordUpdate && wasMinutesAgo(item.lastPasswordUpdate, 15)) throw new ValidationException('Cannot update password right not')
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
    async checkConfirmationToken(data: VerifyConfirmationDTO): Promise<void> {
        const secret = CONFIRMATION_SECRET!

        const payload = await new JwtTokenService<{ userId: string }>().validate(
            data.token,
            secret
        )

        const user = await this.repository.findById(payload.userId);
        if(!user) throw new NotFoundException('no user found');

        user.confirmed = true;

        await this.repository.save(user);
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
        if(user.lastPasswordUpdate && wasMinutesAgo(user.lastPasswordUpdate, 15)) throw new ValidationException('cannot recover right now');

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
}
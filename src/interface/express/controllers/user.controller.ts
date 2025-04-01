import { Response, Request, NextFunction } from 'express';
import { UserUsecase } from "../../../domain/usecases/user.usecase";
import { FindManyUsersDTO } from '../../../domain/interfaces/presenters/dtos/find.many.user.dto';
import { CreateUserDTO } from '../../../domain/interfaces/presenters/dtos/create.user.dto';
import { eventBus } from '../../../infrastructure/event/event.bus';
import { USER_CONFIRMED, USER_CREATED, USER_DELETED } from '../../../domain/constants/event.names';
import { UpdateUserDTO } from '../../../domain/interfaces/presenters/dtos/update.user.dto';
import { USER_PARAM } from '../../../domain/constants/api.routes';
import { VerifyConfirmationDTO } from '../../../domain/interfaces/presenters/dtos/verify.confirmation.dto';
import { RecoverUserDTO } from '../../../domain/interfaces/presenters/dtos/recover.user.dto';
import { LoginUserDTO } from '../../../domain/interfaces/presenters/dtos/login.user.dto';

export class UserController {
    constructor(
        private readonly usecase: UserUsecase,
        ) {}
    
    async register (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const { user, accessToken } = await this.usecase.register(req.body as CreateUserDTO)

            eventBus.emit(USER_CREATED, { user })

            res.status(201).json({
                accessToken
            });
        } catch (error) {
            next(error)
        }
    }

    async deleteById (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const user = await this.usecase.findById(req.params[USER_PARAM]);
            await this.usecase.deleteById(req.params[USER_PARAM])

            eventBus.emit(USER_DELETED, { user })

            res.status(204).end();
        } catch (error) {
            next(error)
        }
    }

    async updateById (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {   
            const user = await this.usecase.update(req.params[USER_PARAM], req.body as UpdateUserDTO)

            res.status(200).json(user);
        } catch (error) {
            next(error)
        }
    }

    async findById (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const user = await this.usecase.findById(req.params[USER_PARAM])
            res.status(200).json(user);
        } catch (error) {
            next(error)
        }
    }

    async findMany (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const results = await this.usecase.findMany(req.query as unknown as FindManyUsersDTO)
            res.status(200).json(results);
        } catch (error) {
            next(error)
        }
    }

    async generateConfirmation (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const user = (req as any).user?.id
            await this.usecase.sendConfirmationEmail({
                userId: user
            })
            res.status(201).end();
        } catch (error) {
            next(error)
        }
    }

    async generateRecover (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            await this.usecase.recover(req.body as RecoverUserDTO)
            res.status(201).end();
        } catch (error) {
            next(error)
        }
    }

    async confirm (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const user = await this.usecase.checkConfirmationToken(req.body as unknown as VerifyConfirmationDTO)

            eventBus.emit(USER_CONFIRMED, { user });
            
            res.status(201).end();
        } catch (error) {
            next(error)
        }
    }

    async login (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const result = await this.usecase.login(req.body as LoginUserDTO)
            res.status(200).json(result)
        } catch (error) {
            next(error)
        }
    }

    async me (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const userId = (req as any).user?.id;
            const user = await this.usecase.findById(userId);
            res.status(200).json(user);
        } catch (error) {
            next(error)
        }
    }

}
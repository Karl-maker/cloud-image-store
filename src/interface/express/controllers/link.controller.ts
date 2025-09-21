import { Response, Request, NextFunction } from 'express';
import { UserUsecase } from "../../../domain/usecases/user.usecase";
import { FindManyUsersDTO } from '../../../domain/interfaces/presenters/dtos/find.many.user.dto';
import { CreateUserDTO } from '../../../domain/interfaces/presenters/dtos/create.user.dto';
import { eventBus } from '../../../infrastructure/event/event.bus';
import { USER_CONFIRMED, USER_CREATED, USER_DELETED } from '../../../domain/constants/event.names';
import { UpdateUserDTO } from '../../../domain/interfaces/presenters/dtos/update.user.dto';
import { LINK_PARAM, USER_PARAM } from '../../../domain/constants/api.routes';
import { VerifyConfirmationDTO } from '../../../domain/interfaces/presenters/dtos/verify.confirmation.dto';
import { RecoverUserDTO } from '../../../domain/interfaces/presenters/dtos/recover.user.dto';
import { LoginUserDTO } from '../../../domain/interfaces/presenters/dtos/login.user.dto';
import { SystemUsageResponse } from '../../../domain/interfaces/presenters/dtos/system.usage.dto';
import { UnauthorizedException } from '../../../application/exceptions/unauthorized.exception';
import { LinkUsecase } from '../../../domain/usecases/link.usecase';
import { COMPANY_DOMAIN } from '../../../application/configuration';

export class LinkController {
    constructor(
        private readonly usecase: LinkUsecase,
        ) {}
    
    async redirect (req: Request, res: Response, next: NextFunction) : Promise<void>  {
        try {
            const { token } = await this.usecase.findById(req.params[LINK_PARAM])

            res.redirect(`${COMPANY_DOMAIN}/collaborate?token=${token}`);
        } catch (error) {
            next(error)
        }
    }


}
import { CreateUserDTO } from "../../domain/interfaces/presenters/dtos/create.user.dto";
import { UpdateUserDTO } from "../../domain/interfaces/presenters/dtos/update.user.dto";
import { PasswordService } from "../../application/services/password/password.service";
import { User } from "../entities/user";
import { UserFilterBy, UserSortBy } from "../types/user";
import { Usecases } from "./usecases";
import { Repository } from "../repositories/repository";
import { UserRepository } from "../repositories/user.repository";

export class UserUsecase extends Usecases<User, UserSortBy, UserFilterBy, UserRepository> {
    constructor (repository: UserRepository) {
        super(repository);
    }

    async mapCreateDtoToEntity(data: CreateUserDTO): Promise<User> {

        const hashResults = await PasswordService.hash(data.password);

        const user : User = {
            first_name: data.firstName,
            last_name: data.lastName,
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
            const hashResults = await PasswordService.hash(data.password);
            delete data['password'];
            item.hashPassword = hashResults.pass;
            item.salt = hashResults.salt;
        }


        const user : User = {
            ...item
        }

        return user;
    }
    
}
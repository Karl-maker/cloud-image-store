import { CreateUserDTO } from "../../domain/interfaces/presenters/dtos/create.user.dto";
import { UpdateUserDTO } from "../../domain/interfaces/presenters/dtos/update.user.dto";
import { PasswordService } from "../../application/services/password/password.service";
import { User } from "../entities/user";
import { UserFilterBy, UserSortBy } from "../types/user";
import { Usecases } from "./usecases";

export class UserUsecase extends Usecases<User, UserSortBy, UserFilterBy> {
    
    async mapCreateDtoToEntity(data: CreateUserDTO): Promise<User> {

        const hashResults = await PasswordService.hash(data.password);

        const user : User = {
            first_name: data.first_name,
            last_name: data.last_name,
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
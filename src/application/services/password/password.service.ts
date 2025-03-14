import bcrypt from 'bcrypt';
import { PEPPER } from '../../configuration';

export class PasswordService {
    static async hash(pass: string): Promise<{
        pass: string;
        salt: string;
    }> {

        const saltRounds = 10; 
        const salt = await bcrypt.genSalt(saltRounds); 
        const pepper = PEPPER; 

        const hashedPassword = await bcrypt.hash(pass + pepper, salt);

        return {
            pass: hashedPassword,
            salt
        }
    }
}
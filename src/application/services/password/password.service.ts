import bcrypt from 'bcryptjs';
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

    /**
     * Compares a plaintext password with the hashed password.
     * @param pass The plaintext password to compare.
     * @param hashedPassword The hashed password to compare against.
     * @param salt The salt that was used to hash the password.
     * @returns A boolean indicating whether the password matches the hashed password.
     */
        static async compare(pass: string, hashedPassword: string, salt: string): Promise<boolean> {
            const pepper = PEPPER;

            const hashedInputPassword = await bcrypt.hash(pass + pepper, salt);
            
            return hashedPassword === hashedInputPassword;
        }
}
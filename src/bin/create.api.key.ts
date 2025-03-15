import { API_KEY_SECRET } from "../application/configuration";
import { JwtTokenService } from "../application/services/token/jwt.token.service";
import { API_KEY_TYPE } from "../domain/enums/api.key";
import { TokenServiceConfiguration } from "../domain/types/token";
import { dateToJwtExp } from "../utils/jwt.time.util";

const run = async () => {
    try {

        const jwt = new JwtTokenService();
        const secret = API_KEY_SECRET;
        const payload = { type: API_KEY_TYPE.website };
        const config : TokenServiceConfiguration = {
            issuer: "admin-script",
            audience: 'cloud-photo-share',
            exp: dateToJwtExp(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
        }
        const token = await jwt.generate(
            payload,
            secret!,
            config
        );

        console.info("API_KEY: ", token);
        process.exit(0); 
    } catch (error) {
        console.error("Error running script:", error);
        process.exit(1); // Exit with failure
    }
};

// Execute the script
run();

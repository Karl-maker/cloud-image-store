export type TokenServiceConfiguration = {
    issuer: string;
    nbf?: number;
    exp: number; // Expiration time (e.g., '1h' or 3600)
    audience?: string; 
    algorithm?: "HS256" | "HS384" | "HS512" | "RS256" | "RS384" | "RS512" | "ES256" | "ES384" | "ES512" | "PS256" | "PS384" | "PS512" | "none"; 
};

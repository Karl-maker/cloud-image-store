export type ConfirmationEmailContent = {
    link: string;
    name: string;
    expiresIn: string;
}

export type RecoveryEmailContent = {
    link: string;
    name: string;
    expiresIn: string;
}

export type SubscriptionSuccessEmailContent = {
    companySupportLink: string;
    features: string[];
    subscriptionPlan: string;
    name: string;
    albumLink: string;
}
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
    albumLink: string;
    features: string[];
    albumName: string;
    subscriptionPlan: string;
    name: string;
}
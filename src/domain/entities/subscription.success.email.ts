import { Templates } from "../constants/templates";
import { SubscriptionSuccessEmailContent } from "../types/email";
import { Email } from "./email";

export interface SubscriptionSuccessEmail extends Email<SubscriptionSuccessEmailContent> {
    template: Templates.SUBSCRIPTION_SUCCESSFUL
}
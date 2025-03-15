import { Templates } from "../constants/templates";
import { ConfirmationEmailContent } from "../types/email";
import { Email } from "./email";

export interface ConfirmationEmail extends Email<ConfirmationEmailContent> {
    template: Templates.CONFIRMATION
}
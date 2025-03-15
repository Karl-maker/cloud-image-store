import { Templates } from "../constants/templates";
import { RecoveryEmailContent } from "../types/email";
import { Email } from "./email";

export interface RecoveryEmail extends Email<RecoveryEmailContent> {
    template: Templates.RECOVERY
}
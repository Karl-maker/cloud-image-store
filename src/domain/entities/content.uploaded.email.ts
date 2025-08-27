import { Email } from "./email";
import { ContentUploadedEmailContent } from "../types/email";
import { Templates } from "../constants/templates";

export interface ContentUploadedEmail extends Email<ContentUploadedEmailContent> {
    template: Templates.CONTENT_UPLOADED
}
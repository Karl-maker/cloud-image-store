import { Email } from "../../../domain/entities/email";
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import path from "path";
import fs from "fs";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { COMPANY_DOMAIN, COMPANY_NAME } from "../../configuration";
import { COOKIE_POLICY_PATH, PRIVACY_POLICY_PATH, SUPPORT_LINK_PATH, TERMS_OF_SERVICES_PATH } from "../../../domain/constants/client.routes";

export class SendEmail {

    private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> ;

    constructor(
        private emailService: string,
        private emailUser: string,
        private emailPass: string
    ) {

        this.transporter = nodemailer.createTransport({
            service: this.emailService,
            auth: {
                user: this.emailUser,
                pass: this.emailPass,
            }
        });
    }

    private async loadTemplate(templateName: string, content: any): Promise<string> {

        const partialsDir = path.resolve("src/application/templates/partials"); // Absolute path to partials
        const templatesDir = path.resolve("src/application/templates/templates"); // Absolute path to templates

        const headerSource = fs.readFileSync(path.join(partialsDir, "header.hbs"), "utf-8");
        const footerSource = fs.readFileSync(path.join(partialsDir, "footer.hbs"), "utf-8");
        const templateSource = fs.readFileSync(path.join(templatesDir, `${templateName}.hbs`), "utf-8");
        const common = {
            year: new Date().getFullYear(),
            companyName: COMPANY_NAME,
            companyWebsite: COMPANY_DOMAIN + SUPPORT_LINK_PATH,
            privacyPolicy: COMPANY_DOMAIN + PRIVACY_POLICY_PATH,
            termsOfServices: COMPANY_DOMAIN + TERMS_OF_SERVICES_PATH,
            cookiePolicy: COMPANY_DOMAIN + COOKIE_POLICY_PATH
        }
        const header = handlebars.compile(headerSource)({ ...common });
        const footer = handlebars.compile(footerSource)({ ...common });
        const template = handlebars.compile(templateSource);

        return `${header}${template({
            ...content,
            ...common
        })}${footer}`;
    }

    async send<Content, E extends Email<Content>>(email: E): Promise<void> {
        const html = await this.loadTemplate(email.template, email.content);

        const mailOptions = {
            from: email.from,
            to: email.to,
            subject: email.subject,
            html,
        };

        await this.transporter.sendMail(mailOptions);
    }
}
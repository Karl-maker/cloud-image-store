"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const handlebars_1 = __importDefault(require("handlebars"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const configuration_1 = require("../../configuration");
const client_routes_1 = require("../../../domain/constants/client.routes");
class SendEmail {
    constructor(emailService, emailUser, emailPass) {
        this.emailService = emailService;
        this.emailUser = emailUser;
        this.emailPass = emailPass;
        this.transporter = nodemailer_1.default.createTransport({
            service: this.emailService,
            auth: {
                user: this.emailUser,
                pass: this.emailPass,
            }
        });
    }
    loadTemplate(templateName, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const partialsDir = path_1.default.resolve("src/application/templates/partials"); // Absolute path to partials
            const templatesDir = path_1.default.resolve("src/application/templates/templates"); // Absolute path to templates
            const headerSource = fs_1.default.readFileSync(path_1.default.join(partialsDir, "header.hbs"), "utf-8");
            const footerSource = fs_1.default.readFileSync(path_1.default.join(partialsDir, "footer.hbs"), "utf-8");
            const templateSource = fs_1.default.readFileSync(path_1.default.join(templatesDir, `${templateName}.hbs`), "utf-8");
            const common = {
                year: new Date().getFullYear(),
                companyName: configuration_1.COMPANY_NAME,
                companyWebsite: configuration_1.COMPANY_DOMAIN,
                privacyPolicy: configuration_1.COMPANY_DOMAIN + client_routes_1.PRIVACY_POLICY_PATH,
                termsOfServices: configuration_1.COMPANY_DOMAIN + client_routes_1.TERMS_OF_SERVICES_PATH,
                cookiePolicy: configuration_1.COMPANY_DOMAIN + client_routes_1.COOKIE_POLICY_PATH
            };
            const header = handlebars_1.default.compile(headerSource)(Object.assign({}, common));
            const footer = handlebars_1.default.compile(footerSource)(Object.assign({}, common));
            const template = handlebars_1.default.compile(templateSource);
            return `${header}${template(Object.assign({}, content))}${footer}`;
        });
    }
    send(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = yield this.loadTemplate(email.template, email.content);
            const mailOptions = {
                from: email.from,
                to: email.to,
                subject: email.subject,
                html,
            };
            yield this.transporter.sendMail(mailOptions);
        });
    }
}
exports.SendEmail = SendEmail;

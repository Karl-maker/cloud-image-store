import { Email } from "../../domain/entities/email";

export class MockEmailService {
    private sentEmails: Email<any>[] = [];

    async send<Content, E extends Email<Content>>(email: E): Promise<void> {
        // Store the email for testing purposes
        this.sentEmails.push(email);
        
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 10));
        
        console.log(`Mock email sent to: ${email.to}`);
    }

    // Test helper methods
    getSentEmails(): Email<any>[] {
        return [...this.sentEmails];
    }

    clearSentEmails(): void {
        this.sentEmails = [];
    }

    getEmailsTo(email: string): Email<any>[] {
        return this.sentEmails.filter(e => e.to === email);
    }
} 
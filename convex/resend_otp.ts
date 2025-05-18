// import { ResendOtpEmail } from "@/components/ui/resend-otp-email";
import { Email } from "@convex-dev/auth/providers/Email";
import { generateRandomString, RandomReader } from "@oslojs/crypto/random";
import { Resend as ResendAPI } from "resend";

const random: RandomReader = {
    read(bytes) {
        crypto.getRandomValues(bytes);
    }
};

export const ResendOTP = Email({
    id: "resend-otp",
    apiKey: process.env.AUTH_RESEND_KEY as string,
    maxAge: 60 * 5,
    async generateVerificationToken() {
        return generateRandomString(random, "0123456789", 8);
    },
    async sendVerificationRequest({
        identifier: email,
        provider,
        token,
        expires,
    }) {
        const resend = new ResendAPI(provider.apiKey);
        const msUntilExpiry = +expires - Date.now();
        const hours = Math.floor(msUntilExpiry / (60 * 60 * 1000));
        const minutes = Math.ceil(msUntilExpiry / (60 * 1000));
        const timeDisplay = hours >= 1
            ? `${hours} hour${hours > 1 ? "s" : ""}`
            : `${minutes} minute${minutes !== 1 ? "s" : ""}`;

        const html = `
        <!DOCTYPE html>
        <html>
            <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Sign in to Expense Tracker</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #f9fafb; color: #111827;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 24px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                <p style="font-size: 14px; margin-bottom: 24px; color: #374151;">
                Please enter the following code on the sign-in page.
                </p>
                <div style="text-align: center; padding: 24px; background-color: #f3f4f6; border-radius: 8px;">
                <p style="font-size: 14px; font-weight: 600; margin: 0; color: #374151;">Verification code</p>
                <p style="font-size: 36px; font-weight: 700; margin: 8px 0; color: #111827;">${token}</p>
                <p style="font-size: 12px; color: #6b7280;">
                    (This code is valid for ${timeDisplay})
                </p>
                </div>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 32px;">
                If you didn’t request this code, you can safely ignore this email.
                </p>
            </div>
            </body>
        </html>
        `;

        const { error } = await resend.emails.send({
            from: "Expense Tracker <onboarding@resend.dev>",
            to: [email],
            subject: `Sign in to Expense Tracker`,
            html,
            // react: ResendOtpEmail({ code: token, expires }),
        });

        if (error) {
            throw new Error(JSON.stringify(error));
        }
    }
})
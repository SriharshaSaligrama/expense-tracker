export type EmailOtpSignIn = {
    error: string;
    success: boolean;
    email: string;
};

export type VerifyOTPEmail = {
    error: string;
    success: boolean;
    email: string;
    code: string;
};

export type PasswordSignIn = {
    error: string;
    success: boolean;
    email: string;
    password: string;
    name?: string;
};
import { useAuthActions } from "@convex-dev/auth/react";
import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitOTPForm } from "@/components/auth/submit-otp-form";
import { FormErrorMessage } from "@/components/ui/form-error-message";
import { z } from "zod";
import { VerifyOTPEmail } from "@/types";
import { useValidator } from "@/hooks/validator";

const initialState: VerifyOTPEmail = {
    error: "",
    success: false,
    email: "",
    code: "",
};

const otpValidationSchema = z.string().trim().min(8, "Code must be 8 digits long");

export function VerifyReceivedCode({ email }: { email: string }) {
    const { signIn } = useAuthActions();

    const verifyCode = async (prevState: VerifyOTPEmail, formData: FormData) => {
        const code = formData.get("code") as string;

        const validation = otpValidationSchema.safeParse(code);

        if (!validation.success) {
            return { ...initialState, error: validation.error.errors[0].message };
        }

        try {
            // Call the signIn function from useAuthActions
            await signIn("resend-otp", formData);
            // Return success state, including the email
            return { success: true, email, code, error: '' };
        } catch (error) {
            console.log("Invalid code:", { error, code, message: error.message });
            // Return error state
            return { ...initialState, error: "Invalid code. Please try again." };
        }
    }

    const [state, formAction, isPending] = useActionState(verifyCode, initialState,);

    const { handleChange, handleSubmit, showError, } = useValidator({ formAction, state, });

    return (
        <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl tracking-tight">
                OTP code verification
            </h2>
            <p className="text-muted-foreground text-sm">
                Enter the 8-digit code we sent to your email address.
            </p>
            <form
                action={handleSubmit}
                className="flex flex-col gap-4"
            >
                <Label htmlFor="code">Code</Label>
                <SubmitOTPForm onChange={handleChange} />
                <Input
                    type="hidden"
                    name="email"
                    value={email}
                />
                {showError && <FormErrorMessage>{state.error}</FormErrorMessage>}
                <Button
                    type="submit"
                    disabled={isPending}
                >
                    Continue
                </Button>
            </form>
        </div>
    )
}
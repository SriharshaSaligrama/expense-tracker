import { useAuthActions } from "@convex-dev/auth/react";
import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormErrorMessage } from "@/components/ui/form-error-message";
import { VerifyReceivedCode } from "@/components/auth/verify-received-code";
import { z } from "zod";
import { EmailOtpSignIn } from "@/types";
import { useValidator } from "@/hooks/validator";

const initialState: EmailOtpSignIn = {
    error: "",
    success: false,
    email: "",
};

const emailSchema = z.string().trim().email("Invalid email address");

export function SendCodeToEmail() {
    const { signIn } = useAuthActions();

    const sendCode = async (prevState: EmailOtpSignIn, formData: FormData) => {
        const email = formData.get("email") as string;

        const validation = emailSchema.safeParse(email);

        if (!validation.success) {
            return { ...initialState, email, error: validation.error.errors[0].message };
        }

        try {
            // Call the signIn function from useAuthActions
            await signIn("resend-otp", formData);
            // Return success state, including the email
            return { success: true, email, error: '' };
        } catch (error) {
            console.log("Error sending code:", { error, message: error.message });
            // Return error state
            return { ...initialState, email, error: "Could not send code. Please try again." };
        }
    }

    const [state, formAction, isPending] = useActionState(sendCode, initialState,);

    const { handleChange, handleSubmit, showError, } = useValidator({ formAction, state, });

    return (
        (state.success && state.email && !state.error) ? <VerifyReceivedCode email={state.email} /> : <form
            action={handleSubmit}
            className="flex flex-col gap-4"
        >
            <Label htmlFor="email">Email</Label>
            <Input
                type="email"
                name="email"
                id="email"
                required
                defaultValue={state.email}
                onChange={handleChange}
            />
            {showError && <FormErrorMessage>{state.error}</FormErrorMessage>}
            <Button
                type="submit"
                disabled={isPending}
            >
                Send OTP
            </Button>
        </form>
    )
}

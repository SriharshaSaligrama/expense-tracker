import { useAuthActions } from "@convex-dev/auth/react";
import { useActionState, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { FormErrorMessage } from "@/components/ui/form-error-message";
import { z } from "zod";
import { PasswordSignIn } from "@/types";
import { useValidator } from "@/hooks/validator";

const initialState: PasswordSignIn = {
    error: "",
    success: false,
    email: "",
    password: "",
    name: "",
};

const loginSchema = z.object({
    email: z.string().trim().email("Invalid email address"),
    password: z.string().trim().min(8, "Password must be at least 8 characters long"),
});

const signUpSchema = z.object({
    name: z.string().trim().min(3, "Name must be at least 3 characters long"),
    email: z.string().trim().email("Invalid email address"),
    password: z.string().trim().min(8, "Password must be at least 8 characters long"),
});

export function SignInWithPassword() {
    const { signIn } = useAuthActions();

    const signInWithPassword = async (prevState: PasswordSignIn, formData: FormData) => {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const name = formData.get("name") as string;
        const flow = formData.get("flow") as string;

        const validation = flow === "signUp" ? signUpSchema.safeParse({ name, email, password }) : loginSchema.safeParse({ email, password });

        if (!validation.success) {
            const newState = {
                ...initialState,
                email,
                password,
                error: validation.error.errors[0].message
            }
            if (flow === "signUp") {
                newState.name = name;
            }
            return newState;
        }

        try {
            // Call the signIn function from useAuthActions
            await signIn("password-custom", formData);
            // Return success state, including the email
            return { success: true, name, email, password, error: '' };
        } catch (error) {
            console.log("Error signing in:", { error, data: error.data, message: error.message });
            const errorInfo = error.message.toLowerCase().includes('invalidsecret') ?
                "Invalid credentials. Please try again." : error.message.toLowerCase().includes('invalidaccountid') ?
                    "Unregistered email. Please sign up first!" : "Could not sign in. Please try again.";
            // Return error state
            return { ...initialState, name, email, password, error: errorInfo };
        }
    }

    const [state, formAction, isPending] = useActionState(signInWithPassword, initialState,);

    const { handleChange, handleSubmit, showError, } = useValidator({ formAction, state, });

    const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");

    return (
        <form
            action={handleSubmit}
            className="flex flex-col gap-4 border p-4 rounded-md shadow-sm"
        >
            {
                flow === "signUp" && <>
                    <Label htmlFor="name">Name</Label>
                    <Input
                        name="name"
                        id="name"
                        required
                        defaultValue={state.name}
                        onChange={handleChange}
                    />
                </>
            }
            <Label htmlFor="basic-email">Email</Label>
            <Input
                type="email"
                name="email"
                id="basic-email"
                required
                defaultValue={state.email}
                onChange={handleChange}
            />
            <Label htmlFor="password">Password</Label>
            <PasswordInput
                name="password"
                id="password"
                required
                defaultValue={state.password}
                onChange={handleChange}
            />
            <Input name="flow" value={flow} type="hidden" />
            {showError && <FormErrorMessage>{state.error}</FormErrorMessage>}
            <Button type="submit" disabled={isPending} className="mt-4">
                {flow === "signIn" ? "Sign in" : "Sign up"}
            </Button>
            <Button
                variant="link"
                type="button"
                onClick={() => {
                    setFlow(flow === "signIn" ? "signUp" : "signIn");
                }}
            >
                {flow === "signIn" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
        </form>
    )
}
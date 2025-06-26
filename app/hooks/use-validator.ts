import { EmailOtpSignIn, PasswordSignIn, VerifyOTPEmail } from "@/types";
import { useState } from "react";

type Validator = {
    formAction: (payload: FormData) => void;
    state: EmailOtpSignIn | PasswordSignIn | VerifyOTPEmail;
}

export function useValidator({ formAction, state }: Validator) {
    const [hasTyped, setHasTyped] = useState(false);

    function handleChange() {
        setHasTyped(true);
    }

    const handleSubmit = async (formData: FormData) => {
        setHasTyped(false); // Reset typing state on submit
        return formAction(formData);
    };

    const showError = state.error && !hasTyped;

    return {
        handleChange,
        handleSubmit,
        showError,
    }
}
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@/components/auth/google-logo";

export function SignInWithGoogle() {
    const { signIn } = useAuthActions();

    return (
        <Button
            className="flex-1"
            variant="secondary"
            type="button"
            onClick={() => void signIn("google")}
        >
            Sign in with Google
            <GoogleLogo className="mr-2 h-4 w-4" />
        </Button>
    );
}
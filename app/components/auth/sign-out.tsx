import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOut() {
    const { signOut } = useAuthActions();

    return (
        <Button
            className="flex-1 items-center cursor-pointer"
            variant="secondary"
            type="button"
            onClick={() => void signOut()}
        >
            <LogOut />
            Sign out
        </Button>
    );
}
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOut() {
    const { signOut } = useAuthActions();

    return (<Button
        className="gap-2 items-center cursor-pointer h-10"
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => void signOut()}
        title="Sign out"
    >
        <LogOut className="h-5 w-5" />
    </Button>
    );
}
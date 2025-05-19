import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

function FormErrorMessage({ className, children, ...props }: ComponentProps<"p">) {
    return (
        <p
            className={cn("text-xs font-medium text-destructive", className)}
            {...props}
            role="alert"
        >
            {children}
        </p>
    )
}

FormErrorMessage.displayName = "FormErrorMessage"

export { FormErrorMessage }
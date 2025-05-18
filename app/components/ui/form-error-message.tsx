import { cn } from "@/lib/utils";

function FormErrorMessage({ className, children, ...props }: React.ComponentProps<"p">) {
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
import React from "react";

export class ErrorBoundary extends React.Component<{
    children: React.ReactNode;
    errorMessage?: string;
}, { hasError: boolean; error: Error | null }> {
    constructor(props: { children: React.ReactNode; errorMessage?: string }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            // Show custom error message if provided, else fallback to default
            return <div className="p-8 text-center text-destructive">
                {this.props.errorMessage || "Something went wrong."}
            </div>;
        }
        return this.props.children;
    }
}
import React, { useEffect } from 'react';
import {
    Outlet,
    createRootRouteWithContext,
    HeadContent,
    Scripts,
    useNavigate,
} from '@tanstack/react-router';
import { QueryClient } from "@tanstack/react-query";
import { BadgeIndianRupee } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';

import appCss from "@/styles/app.css?url";
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react';
import { Card, CardContent } from '@/components/ui/card';
import { SignInWithGoogle } from '@/components/auth/sign-in-with-google';
import { SignInMethodDivider } from '@/components/auth/sign-in-method-divider';
import { SendCodeToEmail } from '@/components/auth/send-code-to-email';
import { SignInWithPassword } from '@/components/auth/sign-in-with-password';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layouts/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SignOut } from '@/components/auth/sign-out';
import { Toaster } from 'sonner';

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
}>()({
    head: () => ({
        meta: [
            {
                charSet: 'utf-8',
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            {
                title: 'Expense Tracker Tanstack Start Convex',
            },
        ],
        links: [
            {
                rel: "stylesheet",
                href: appCss,
            },
        ],
    }),
    component: RootComponent,
});

function RootComponent() {
    useEffect(() => {
        // Check if user prefers dark mode
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    return (
        <RootDocument>
            <Outlet />
        </RootDocument>
    );
}

function RootDocument({ children }: Readonly<{ children: React.ReactNode }>) {
    const navigate = useNavigate();

    return (
        <html lang="en" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
            <head>
                <HeadContent />
            </head>
            <body>
                <AuthLoading>
                    Authenticating... <br />
                </AuthLoading>
                <Unauthenticated>
                    <div className="flex justify-center items-center h-screen">
                        <Card className="w-full max-w-sm max-h-screen overflow-auto">
                            <CardContent>
                                <div className="flex flex-col gap-4 justify-center">
                                    <SignInWithGoogle />
                                    <SignInMethodDivider />
                                    <SendCodeToEmail />
                                    <SignInMethodDivider />
                                    <SignInWithPassword />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </Unauthenticated>
                <Authenticated>
                    <SidebarProvider>
                        <AppSidebar />
                        <SidebarInset>
                            <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                                <SidebarTrigger className="-ml-1 cursor-pointer" />
                                <Separator orientation="vertical" className="mr-2 h-4" />                                <div className="flex-1">
                                    <Breadcrumb>
                                        <BreadcrumbList>
                                            <BreadcrumbItem>
                                                <BreadcrumbPage className="cursor-pointer" onClick={() => navigate({ to: "/" })}>
                                                    <h3 className="text-md font-bold flex items-center gap-2">
                                                        <BadgeIndianRupee />
                                                        Expense Tracker
                                                    </h3>
                                                </BreadcrumbPage>
                                            </BreadcrumbItem>
                                        </BreadcrumbList>
                                    </Breadcrumb>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ThemeToggle />
                                    <SignOut />
                                </div>
                            </header>
                            <main className="flex flex-col p-4">
                                {children}
                            </main>
                        </SidebarInset>
                    </SidebarProvider>
                </Authenticated>
                <Scripts />
                <Toaster />
            </body>
        </html>
    );
}
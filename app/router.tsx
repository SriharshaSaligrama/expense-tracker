import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { QueryClient } from "@tanstack/react-query";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexProvider } from "convex/react";
import { routeTree } from './routeTree.gen'
import { ReactNode } from 'react';

export function createRouter() {
    const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string;

    if (!CONVEX_URL) {
        console.error("missing envar VITE_CONVEX_URL");
    }

    const convexQueryClient = new ConvexQueryClient(CONVEX_URL);

    const queryClient: QueryClient = new QueryClient({
        defaultOptions: {
            queries: {
                queryKeyHashFn: convexQueryClient.hashFn(),
                queryFn: convexQueryClient.queryFn(),
            },
        },
    });

    convexQueryClient.connect(queryClient);

    const router = routerWithQueryClient(
        createTanStackRouter({
            routeTree,
            scrollRestoration: true,
            defaultPreload: "intent",
            context: { queryClient },
            Wrap: ({ children }: { children: ReactNode }) => (
                <ConvexAuthProvider client={convexQueryClient.convexClient}>
                    <ConvexProvider client={convexQueryClient.convexClient}>
                        {children}
                    </ConvexProvider>
                </ConvexAuthProvider>
            ),
        }),
        queryClient,
    )

    return router
}

declare module '@tanstack/react-router' {
    interface Register {
        router: ReturnType<typeof createRouter>
    }
}
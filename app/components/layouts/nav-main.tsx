"use client"

import { type LucideIcon } from "lucide-react"

import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"

export function NavMain({
    items,
}: {
    items: {
        title: string
        url: string
        icon: LucideIcon
        isActive?: boolean
    }[]
}) {
    return (
        <SidebarMenu>
            {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                        <Link
                            to={item.url}
                            activeProps={{
                                className: 'bg-primary/10 text-primary font-bold',
                            }}
                            activeOptions={{ exact: true }}
                            className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-accent/40 hover:text-accent-foreground"
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    )
}

import * as React from "react"
import { Home, ReceiptIndianRupee } from "lucide-react"

import { NavUser } from "@/components/layouts/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { useSuspenseQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "convex/_generated/api"

const data = {
    navMain: [
        {
            title: "Home",
            url: "/",
            icon: Home,
        },
        {
            title: "Transactions",
            url: "/transactions",
            icon: ReceiptIndianRupee,
        },
    ],
}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: user } = useSuspenseQuery(convexQuery(api.current_user.currentUser, {}));
    const navUser = {
        name: user?.name || '',
        email: user?.email || '',
        avatar: user?.name || '',
    }

    return (
        <Sidebar {...props}>
            <SidebarHeader className="border-sidebar-border h-16 border-b">
                <div className="flex flex-col gap-2">
                    <NavUser user={navUser} />
                    <NavMain items={data.navMain} />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarSeparator className="mx-0" />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}

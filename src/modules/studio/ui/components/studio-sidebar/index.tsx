"use client";
import { Sidebar, SidebarContent, SidebarMenuButton, SidebarMenuItem , SidebarMenu , SidebarGroup } from "@/components/ui/sidebar";
import Link from "next/link";
import { LogOutIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {StudioSidebarHeader} from "@/modules/studio/ui/components/studio-sidebar/studio-sidebar-header"
export const StudioSidebar = ()=>{
    const pathname = usePathname();

    return(
        <Sidebar className="pt-16 z-40 " collapsible="icon">
            <SidebarContent className="bg-background" >
                <SidebarGroup>
                <SidebarMenu>
                <StudioSidebarHeader/>
                <SidebarMenuItem>
                    <SidebarMenuButton isActive={pathname==="/studio"} tooltip="Exit studio" asChild>
                       <Link prefetch href="/studio">
                         <LogOutIcon className="size-5"/>
                         <span className="text-sm">Content</span>
                       </Link>

                    </SidebarMenuButton>
                </SidebarMenuItem>
                <Separator/>
                <SidebarMenuItem>
                    <SidebarMenuButton  tooltip="Exit studio" asChild>
                       <Link prefetch href="/studio">
                         <LogOutIcon className="size-5"/>
                         <span className="text-sm">Exit Studio</span>
                       </Link>

                    </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            </SidebarContent>

        </Sidebar>
    )
}
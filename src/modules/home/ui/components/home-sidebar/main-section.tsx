"use client"

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem  } from "@/components/ui/sidebar";
import { HomeIcon, PlaySquareIcon } from "lucide-react"
import Link from "next/link";




const items = [
    {
        title : "Home",
        url : "/",
        icon : HomeIcon,
        auth : true,
    },
    {
        title : "Subscriptions",
        url : "/feed/subscriptions",
        icon : PlaySquareIcon
    },
     {
        title : "Trending",
        url : "/feed/trending",
        icon : PlaySquareIcon
    },
];

export const MainSection = () =>{
    return(
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item)=>(
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                            tooltip={item.title}
                            asChild
                            isActive={false}  // change to look at current pathname
                            onClick={()=>{}}  // do something on click 
                            >
                                <Link href={item.url} className="flex item-center gap-4">

                                   <item.icon/>
                                   <span className="text-sm">{item.title}</span>
                                </Link>
                              
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
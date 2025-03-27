import * as React from "react";
import { Link } from "react-router";
import { PlusCircle } from "lucide-react";
import { Button } from "shared/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "shared/components/ui/sidebar";

// This is sample data.
const data = {
  navMain: [
    {
      title: "チャット",
      url: "#",
      items: [
        {
          title: "チャット1",
          url: "#",
          isActive: false,
        },
        {
          title: "チャット2",
          url: "#",
          isActive: false,
        },
        {
          title: "チャット3",
          url: "#",
          isActive: false,
        },
        {
          title: "チャット4",
          url: "#",
          isActive: false,
        },
        {
          title: "チャット5",
          url: "#",
          isActive: false,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Button
          asChild
          variant="secondary"
          className="w-full px-3 bg-zinc-800 hover:bg-zinc-700 text-white"
        >
          <Link to="/chats/new" className="flex items-center justify-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            New
          </Link>
        </Button>
      </SidebarHeader>
      <div className="relative mt-5 mx-3">
        <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center z-50 pointer-events-none">
          <span className="text-white font-semibold text-xl">Coming soon</span>
        </div>
        <SidebarContent>
          {/* We create a SidebarGroup for each parent. */}
          {data.navMain.map((item) => (
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {item.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.isActive}
                        disabled
                      >
                        <a href={item.url}>{item.title}</a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </div>
      <SidebarRail />
    </Sidebar>
  );
}

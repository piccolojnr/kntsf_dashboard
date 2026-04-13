"use client";
import {
  BarChart3,
  FileCheck,
  Settings2,
  Users,
  Shield,
  Newspaper,
  Calendar,
  Mail,
  Package,
  Brain,
  BadgeCheck,
  Vote,
} from "lucide-react";
import * as React from "react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "../ui/sidebar";
import { cn } from "../../lib/utils";
import { SessionUser } from "@/lib/types/common";
import { AccessRoles } from "@/lib/role";
import Image from "next/image";
export function AppSidebar({
  user,
  permissions,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: SessionUser;
  permissions: AccessRoles;
}) {
  const { open, openMobile } = useSidebar();

  // This is sample data.
  const navigationData = {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: BarChart3,
        isActive: true,
      },
      {
        title: "News",
        url: "/dashboard/news",
        icon: Newspaper,
        show: () => permissions.isPro, // Always show for logged-in users
      },
      {
        title: "Events",
        url: "/dashboard/events",
        icon: Calendar,
        show: () => permissions.isPro,
      },
      {
        title: "Newsletters",
        url: "/dashboard/newsletters",
        icon: Mail,
        show: () => permissions.isPro,
      },
      {
        title: "Ideas",
        url: "/dashboard/ideas",
        icon: Brain,
        show: () => permissions.isExecutive,
      },
      {
        title: "Polls",
        url: "/dashboard/polls",
        icon: Vote,
        show: () => permissions.isPro,
      },
      {
        title: "Elections",
        url: "/dashboard/elections",
        icon: BadgeCheck,
        show: () => permissions.isExecutive,
      },
      {
        title: "Documents",
        url: "/dashboard/documents",
        icon: Package,
        show: () => permissions.isExecutive,
      },
      {
        title: "Permits",
        url: "/dashboard/permits",
        icon: FileCheck,
        show: () => permissions.isExecutive,
      },
      {
        title: "Students",
        url: "/dashboard/students",
        icon: Users,
        show: () => permissions.isExecutive,
      },
      {
        title: "Administration",
        url: "/dashboard/admin",
        icon: Shield,
        show: () => permissions.isAdmin,
        items: [
          {
            title: "Users",
            url: "/dashboard/admin/users",
            show: () => permissions.isAdmin,
          },
          {
            title: "Payments",
            url: "/dashboard/admin/payments",
            show: () => permissions.isAdmin,
          },
          {
            title: "Roles",
            url: "/dashboard/admin/roles",
            show: () => permissions.isAdmin,
          },
          {
            title: "Settings",
            url: "/dashboard/admin/settings",
            show: () => permissions.isAdmin,
          },
        ],
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings2,
        show: () => permissions.isAdmin,
        items: [
          {
            title: "Reports",
            url: "/dashboard/settings/reports",
            show: () => permissions.isAdmin,
          },
        ],
      },
    ],
  };

  // Filter navigation items based on permissions
  const filteredNavItems = navigationData.navMain
    .filter((item) => {
      if (item.show) {
        return item.show();
      }
      return true;
    })
    .map((item) => ({
      ...item,
      items: item.items?.filter((subItem) => {
        if (subItem.show) {
          return subItem.show();
        }
        return true;
      }),
    }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Image
          src="/logo.png"
          alt="Permit Manager Logo"
          className={cn(
            "w-8 h-8 rounded-full",
            open && "hidden",
            openMobile && "hidden"
          )}
          width={32}
          height={32}
        />
        <div className="flex items-center gap-2 px-4">
          <Image
            src="/logo.png"
            alt="Permit Manager Logo"
            className="w-8 h-8 rounded-full"
            width={32}
            height={32}
          />
          <h1
            className={cn(
              "text-lg font-semibold",
              !open && !openMobile && "hidden"
            )}
          >
            Permit Manager
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

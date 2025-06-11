"use client";
import {
  BarChart3,
  FileCheck,
  Settings2,
  Users,
  Shield,
  Search,
  User,
} from "lucide-react";
import * as React from "react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { Input } from "../ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "../ui/sidebar";
import { cn } from "../../lib/utils";
import { useRouter } from "next/navigation";
import { SessionUser } from "@/lib/types/common";
import { AccessPermissions } from "@/lib/permissions";
import Image from "next/image";
export function AppSidebar({
  user,
  permissions,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: SessionUser;
  permissions: AccessPermissions;
}) {
  const { open, openMobile, toggleSidebar } = useSidebar();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page with query parameter
      router.push(
        `/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
      setSearchQuery("");
    }
  };

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
        icon: User,
        show: () => permissions.canViewNews, // Always show for logged-in users
      },
      {
        title: "Permits",
        url: "/dashboard/permits",
        icon: FileCheck,
        show: () => permissions.canViewPermits,
      },
      {
        title: "Students",
        url: "/dashboard/students",
        icon: Users,
        show: () => permissions.canViewStudents,
      },
      {
        title: "Administration",
        url: "/dashboard/admin",
        icon: Shield,
        show: () =>
          permissions.canManageUsers ||
          permissions.canManageRoles ||
          permissions.canManagePermissions,
        items: [
          {
            title: "Users",
            url: "/dashboard/admin/users",
            show: () => permissions.canManageUsers,
          },
          {
            title: "Roles",
            url: "/dashboard/admin/roles",
            show: () => permissions.canManageRoles,
          },
          {
            title: "Permissions",
            url: "/dashboard/admin/permissions",
            show: () => permissions.canManagePermissions,
          },
        ],
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings2,
        show: () => permissions.canViewReports,
        items: [
          {
            title: "Reports",
            url: "/dashboard/settings/reports",
            show: () => permissions.canViewReports,
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
        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className={cn(
            "px-4 mb-4 mt-1",
            "flex items-center justify-between",
            open ? "w-full" : "w-64"
          )}
        >
          <div className={cn("relative", !open ? "hidden" : "block")}>
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e: {
                target: { value: React.SetStateAction<string> };
              }) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div
            className={cn(
              "relative",
              open ? "hidden" : "block",
              openMobile && "hidden"
            )}
          >
            <button
              type="submit"
              className="transition-colors text-muted-foreground hover:text-primary"
              onClick={toggleSidebar}
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
        <NavMain items={filteredNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

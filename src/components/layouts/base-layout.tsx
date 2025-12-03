"use client";
import { AppSidebar } from "./app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "./theme-toggle";
import { BackToTop } from "./back-to-top";
import { SystemStatus } from "./system-status";
import { usePathname, useRouter } from "next/navigation";
import { SessionUser } from "@/lib/types/common";
import { AccessRoles } from "@/lib/role";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "../ui/input";

export const BaseLayout = ({
  children,
  user,
  permissions,
}: {
  children: React.ReactNode;
  user: SessionUser;
  permissions: AccessRoles;
}) => {
  const pathname = usePathname();
  const endpoints = pathname.split("/").filter(Boolean);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

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
  return (
    <SidebarProvider>
      <AppSidebar user={user} permissions={permissions} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4 mr-2" />
            <Breadcrumb>
              <BreadcrumbList className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
                {endpoints.map((endpoint: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <BreadcrumbItem key={index} className="hidden md:block">
                      <BreadcrumbLink
                        href={`/${endpoints.slice(0, index + 1).join("/")}`}
                      >
                        {endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index < endpoints.length - 1 && (
                      <BreadcrumbSeparator className="hidden mt-1 md:block" />
                    )}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2 px-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-9 w-[200px] lg:w-[300px] bg-background"
              />
            </form>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <SystemStatus />
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-col flex-1 gap-4 p-4 pt-0">{children}</div>
        <footer className="px-6 py-4 text-sm text-center border-t text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Broke Dbee Inc. All rights reserved.
          </p>
        </footer>
        <BackToTop />
      </SidebarInset>
    </SidebarProvider>
  );
};

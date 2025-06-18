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
import { usePathname } from "next/navigation";
import { SessionUser } from "@/lib/types/common";
import { AccessRoles } from "@/lib/role";

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
  return (
    <SidebarProvider>
      <AppSidebar user={user} permissions={permissions} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
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
          <div className="flex items-center gap-4 px-4">
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

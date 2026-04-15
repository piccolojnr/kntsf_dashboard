import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elections - Permit Management System",
  description: "View and manage student elections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

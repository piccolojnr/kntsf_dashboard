import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center w-screen h-screen bg-gray-100 dark:bg-background"
      style={{ minHeight: "100vh" }}
    >
      <div className="container flex flex-col items-center justify-center w-full h-full">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h1 className="text-xl font-bold leading-tight tracking-tighter md:text-3xl lg:leading-[1.1]">
            404 - Page Not Found
          </h1>
          <p className="max-w-[750px] text-md text-muted-foreground sm:text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <Button asChild className="mt-4 rounded-md">
            <Link href="/dashboard">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

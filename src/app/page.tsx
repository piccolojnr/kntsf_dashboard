import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Shield, Clock, FileCheck } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 px-4 py-16 md:py-24 bg-gradient-to-b from-background to-muted">
        <div className="container max-w-5xl mx-auto space-y-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Welcome to the{" "}
            <span className="text-primary">Permit Management System</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
            Streamline your permit management process with our comprehensive
            solution. Create, track, and manage permits efficiently.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 bg-background">
        <div className="container max-w-5xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center">Key Features</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 mb-4 text-primary" />
                <CardTitle>Secure Management</CardTitle>
                <CardDescription>
                  Robust security measures to protect your permit data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced authentication and authorization systems ensure your
                  data remains secure and accessible only to authorized
                  personnel.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="w-10 h-10 mb-4 text-primary" />
                <CardTitle>Real-time Tracking</CardTitle>
                <CardDescription>
                  Monitor permit status and expiration dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Stay informed with real-time updates on permit status,
                  expiration dates, and renewal notifications.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileCheck className="w-10 h-10 mb-4 text-primary" />
                <CardTitle>Easy Verification</CardTitle>
                <CardDescription>
                  Quick and simple permit verification process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Verify permits instantly with our streamlined process, saving
                  time and reducing administrative overhead.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-4 text-sm text-center border-t text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Broke Dbee Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import {
  setStudentPasswordAction,
  validateStudentAuthTokenAction,
} from "@/app/actions/student-auth.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TokenState =
  | { status: "loading" }
  | { status: "invalid"; message: string }
  | {
      status: "valid";
      student: {
        name: string;
        studentId: string;
        email: string;
        username: string;
      };
    }
  | { status: "success" };

function getInvalidMessage(reason?: string) {
  switch (reason) {
    case "expired":
      return "This password setup link has expired.";
    case "used":
      return "This password setup link has already been used.";
    default:
      return "This password setup link is invalid.";
  }
}

export function StudentPasswordSetupClient() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [tokenState, setTokenState] = useState<TokenState>({ status: "loading" });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;

    async function validate() {
      if (!token) {
        setTokenState({
          status: "invalid",
          message: "Password setup token is missing.",
        });
        return;
      }

      const response = await validateStudentAuthTokenAction(token);
      if (!isMounted) return;
      const validation = response.success && "data" in response ? response.data : null;

      if (!response.success || !validation?.valid || !validation.student) {
        setTokenState({
          status: "invalid",
          message: getInvalidMessage(validation?.reason),
        });
        return;
      }

      setTokenState({
        status: "valid",
        student: validation.student,
      });
    }

    validate();

    return () => {
      isMounted = false;
    };
  }, [token]);

  function handleSubmit() {
    setFormError(null);

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const response = await setStudentPasswordAction(token, password);
      if (!response.success) {
        setFormError(response.error || "Password could not be set.");
        return;
      }

      setTokenState({ status: "success" });
      setPassword("");
      setConfirmPassword("");
    });
  }

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-10">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Student App Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {tokenState.status === "loading" ? (
            <p className="text-sm text-muted-foreground">Checking your setup link...</p>
          ) : null}

          {tokenState.status === "invalid" ? (
            <p className="text-sm text-destructive">{tokenState.message}</p>
          ) : null}

          {tokenState.status === "success" ? (
            <div className="space-y-2">
              <p className="font-medium">Password set successfully.</p>
              <p className="text-sm text-muted-foreground">
                You can now sign in to the mobile app with your student account.
              </p>
            </div>
          ) : null}

          {tokenState.status === "valid" ? (
            <>
              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                <p className="font-medium">{tokenState.student.name}</p>
                <p className="text-muted-foreground">
                  Username: {tokenState.student.username}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>

              {formError ? (
                <p className="text-sm text-destructive">{formError}</p>
              ) : null}

              <Button
                className="w-full"
                disabled={isPending || !password || !confirmPassword}
                onClick={handleSubmit}
              >
                {isPending ? "Saving..." : "Set Password"}
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}

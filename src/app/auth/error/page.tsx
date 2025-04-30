"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function ErrorPageContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorTitle = "Authentication Error";
  let errorMessage = "An error occurred during authentication. Please try again.";

  if (error === "AccessDenied") {
    errorTitle = "Access Denied";
    errorMessage = "You do not have permission to sign in.";
  } else if (error === "Verification") {
    errorTitle = "Verification Failed";
    errorMessage = "The verification link may have expired or been used already.";
  } else if (error === "OAuthSignin") {
    errorTitle = "OAuth Sign In Error";
    errorMessage = "There was a problem with the OAuth sign in.";
  } else if (error === "OAuthCallback") {
    errorTitle = "OAuth Callback Error";
    errorMessage = "There was a problem with the OAuth callback.";
  }

  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{errorTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/auth/signin">
            <Button>Try Again</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorPageContent />
    </Suspense>
  );
}
"use client";

import { LoginButton } from "@/components/auth-buttons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignIn() {
  const router = useRouter();
   const { data: session, status } = useSession();
   useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/swipe");
    }
  }, [status, session]);
  
 

  return (
    <div className=" flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to DevSync</CardTitle>
          <CardDescription>
            Sign in with your GitHub account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="rounded-full bg-muted p-8">
            <GithubLogo className="w-12 h-12" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground px-6">
              We'll use your GitHub profile to help match you with developers
              with similar interests and skills.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <LoginButton />
          <p className="text-xs text-center text-muted-foreground mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

function GithubLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

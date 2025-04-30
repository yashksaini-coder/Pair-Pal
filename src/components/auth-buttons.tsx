"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github, LogOut, Router } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginButton() {
  const router = useRouter();
  const handleSignin = async () => {
    await signIn("github");
    router.push("/swipe");
  };
  return (
    <Button onClick={handleSignin} className="flex cursor-pointer gap-2">
      <Github size={18} />
      Sign in with GitHub
    </Button>
  );
}

export function LogoutButton() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    return null;
  }

  return (
    <Button
      onClick={async () => {
        await signOut();
        window.location.href = "/";
        router.push("/");
      }}
      variant="outline"
      className="flex gap-2 cursor-pointer"
    >
      <LogOut size={18} />
      Sign Out
    </Button>
  );
}

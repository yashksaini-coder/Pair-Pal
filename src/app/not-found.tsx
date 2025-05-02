"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home, ArrowLeft, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const [countdown, setCountdown] = useState(10);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (countdown > 0 && !isRedirecting) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isRedirecting) {
      setIsRedirecting(true);
      router.push("/");
    }
  }, [countdown, isRedirecting, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            type: "spring",
            stiffness: 200,
          }}
          className="relative"
        >
          <div className="text-9xl font-extrabold text-primary opacity-10 select-none">
            404
          </div>
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "mirror",
              duration: 5,
              ease: "easeInOut",
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-9xl font-ClashDisplayBold text-emerald-400 text-primary select-none">
              404
            </div>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold tracking-tight">Page not found</h2>
          <p className="mt-2 text-muted-foreground">
            Oops! The page you&#39;re looking for doesn&#39;t exist or has been moved.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild>
            <Link href="/" className="gap-2">
              <Home className="h-4 w-4" />
              Go to Homepage
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="javascript:history.back()" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="text-sm text-muted-foreground"
        >
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Redirecting to homepage in {countdown} seconds
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";

interface MatchNotificationProps {
  isOpen: boolean;
  username: string;
  avatarUrl?: string;
  onClose: () => void;
  onViewMatch: () => void;
}

export function MatchNotification({
  isOpen,
  username,
  avatarUrl,
  onClose,
  onViewMatch,
}: MatchNotificationProps) {
  React.useEffect(() => {
    if (isOpen) {
      // Trigger confetti when a match is shown
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="bg-card rounded-lg shadow-lg p-6 max-w-md w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-2 text-primary">
              It's a Match!
            </h2>
            <p className="mb-6">
              You and <span className="font-semibold">{username}</span> have liked each other.
            </p>
            
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-green-500">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-2xl">
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <Button onClick={onViewMatch} className="w-full">
                Send a Message
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Keep Swiping
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function Providers({ children }: { children: ReactNode }) {
  // 1. Initialize QueryClient inside useState to ensure it's a singleton per session
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* 2. AnimatePresence handles mounting/unmounting animations for the whole app */}
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* 3. Global Toast Notifications (Sonner) */}
      <Toaster richColors />
    </QueryClientProvider>
  );
}

"use client"

import { SessionProvider } from "next-auth/react"
import { ToastProvider } from "@/components/toast-provider"
import type React from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  )
}

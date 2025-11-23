"use client"

import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ToastProvider } from "@/components/toast-provider"
import { useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <ToastProvider>
      <div className="flex h-screen bg-[#E8F0F8]">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </ToastProvider>
  )
}

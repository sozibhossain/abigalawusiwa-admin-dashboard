"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/toast-provider"
import { authApi } from "@/lib/api"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const { addToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      addToast({ title: "Passwords do not match", type: "error" })
      return
    }

    if (password.length < 6) {
      addToast({ title: "Password must be at least 6 characters", type: "error" })
      return
    }

    setLoading(true)

    try {
      await authApi.resetPassword(email, password)
      addToast({ title: "Password reset successfully", type: "success" })
      router.push("/auth/login")
    } catch (error: any) {
      addToast({
        title: error?.response?.data?.message || "Failed to reset password",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <Image src="/logo.png" alt="Mimi Africa" width={120} height={40} className="h-10 w-auto" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600 text-sm">Create a new password for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Create new password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm new password</label>
              <Input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="bg-white"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-base">
              {loading ? "Updating..." : "Update password"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Back to Login
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

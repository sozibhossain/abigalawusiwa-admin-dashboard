"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/toast-provider"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { addToast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        addToast({ title: "Login successful", type: "success" })
        router.push("/dashboard")
      } else {
        addToast({ title: result?.error || "Login failed", type: "error" })
      }
    } catch (error) {
      addToast({ title: "An error occurred", type: "error" })
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome</h1>
            <p className="text-gray-600 text-sm">Please sign in to continue managing Mimi Stores Africa</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username or Email</label>
              <Input
                type="email"
                placeholder="Write your name or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <Input
                type="password"
                placeholder="Write your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-white"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-base">
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Forgot Password?
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

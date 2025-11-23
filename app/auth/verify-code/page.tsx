"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/toast-provider"
import { authApi } from "@/lib/api"

export default function VerifyCodePage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const { addToast } = useToast()

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleBackspace = (index: number) => {
    if (index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join("")

    if (otpCode.length !== 6) {
      addToast({ title: "Please enter all 6 digits", type: "error" })
      return
    }

    setLoading(true)

    try {
      await authApi.verifyCode(email, otpCode)
      addToast({ title: "OTP verified successfully", type: "success" })
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`)
    } catch (error: any) {
      addToast({
        title: error?.response?.data?.message || "Invalid OTP",
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Email</h1>
            <p className="text-gray-600 text-sm">Enter the OTP sent to verify your email</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2 justify-center">
              {otp.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") {
                      handleBackspace(index)
                    }
                  }}
                  disabled={loading}
                  className="w-12 h-12 text-center text-2xl border-2 border-blue-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              ))}
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-base">
              {loading ? "Verifying..." : "Verify"}
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

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { erningApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function EarningsPage() {
  const [loading, setLoading] = useState(true)
  const [earnings, setEarnings] = useState<any>(null)

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    try {
      const response = await erningApi.getEarnings()

      if (response.data.status) {
        setEarnings(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching earnings:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !earnings) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  const performance = earnings.performance || []

  // For progress bar width
  const maxEarnings = Math.max(...performance.map((p: any) => p.totalEarnings || 0), 0)

  const chartData = performance.map((item: any) => ({
    month: item.month.split(" ")[0], // "Nov 2025" → "Nov"
    earnings: item.totalEarnings,
  }))

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0)

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(earnings.totalEarnings)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">This Month</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(earnings.monthlyEarnings)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{earnings.totalOrders}</p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="earnings" fill="#0052CC" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Performance */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col">
            <CardTitle className="text-base font-semibold text-gray-900">
              Monthly Performance
            </CardTitle>
            <span className="text-xs text-gray-500">
              Your earning trend over the last 5 months
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {performance.map((item: any) => {
              const orders = item.orders ?? item.totalOrders
              const avg =
                item.averageEarnings ?? item.average ?? item.avgOrderValue ?? item.avg

              const percent =
                maxEarnings > 0
                  ? Math.min(100, (item.totalEarnings / maxEarnings) * 100)
                  : 0

              return (
                <div
                  key={item.month}
                  className="py-3 border-b last:border-b-0 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800">
                        {item.month}
                      </span>
                      {orders !== undefined && (
                        <span className="text-xs text-gray-500">
                          {orders} orders
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.totalEarnings)}
                      </span>
                      {avg !== undefined && (
                        <span className="text-xs text-gray-500">
                          Avg: {formatCurrency(avg)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

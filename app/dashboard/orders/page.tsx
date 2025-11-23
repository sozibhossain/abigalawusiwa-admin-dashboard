"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useToast } from "@/components/toast-provider"
import { orderApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"

interface Order {
  _id: string
  productTitle: string
  customerName: string
  totalAmount: number
  status: string
  createdAt: string
}

export default function OrdersPage() {
  const { addToast } = useToast()
  const { data: session } = useSession()

  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // ----------------------------------------
  // 🔥 FETCH ORDERS
  // ----------------------------------------
  const fetchOrders = async () => {
    try {
      setLoading(true)

      const res = await orderApi.getAll(currentPage, 10)

      const rawOrders = res.data.data.orders
      const pagination = res.data.data.pagination

      // 🎯 Transform API → Frontend-friendly data
      const mappedOrders = rawOrders.map((o: any) => ({
        _id: o._id,
        productTitle: o.productDetails?.title || "N/A",
        customerName: o.buyer?.name || "N/A",
        createdAt: o.createdAt,
        totalAmount: o.amount,
        status: o.orderStatus, // completed/pending/accepted etc.
      }))

      setOrders(mappedOrders)
      setTotalPages(pagination?.totalPages || 1)
    } catch (err: any) {
      addToast({
        type: "error",
        message: err?.response?.data?.message || "Failed to load orders",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!session) return
    fetchOrders()
  }, [session, currentPage])

  // ----------------------------------------
  // 🔍 FILTERING
  // ----------------------------------------
  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      order.productTitle.toLowerCase().includes(search) ||
      order.customerName.toLowerCase().includes(search)

    const matchesStatus =
      filterStatus === "all" ||
      order.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "accepted":
        return "bg-blue-100 text-blue-700"
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr key={order._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{order.productTitle}</td>
                          <td className="py-3 px-4 text-gray-600">{order.customerName}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            ${order.totalAmount}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">
                          No orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>

                  <Button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

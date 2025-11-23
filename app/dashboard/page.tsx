"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react"

const paymentData = [
  { month: "Jan", value: 25 },
  { month: "Feb", value: 35 },
  { month: "Mar", value: 45 },
  { month: "Apr", value: 40 },
  { month: "May", value: 55 },
  { month: "Jun", value: 50 },
  { month: "Jul", value: 65 },
  { month: "Aug", value: 60 },
  { month: "Sep", value: 70 },
  { month: "Oct", value: 75 },
  { month: "Nov", value: 80 },
  { month: "Dec", value: 90 },
]

const orderData = [
  { month: "Jan", value: 45 },
  { month: "Feb", value: 65 },
  { month: "Mar", value: 95 },
  { month: "Apr", value: 70 },
  { month: "May", value: 80 },
  { month: "Jun", value: 45 },
  { month: "Jul", value: 85 },
  { month: "Aug", value: 55 },
  { month: "Sep", value: 75 },
  { month: "Oct", value: 80 },
  { month: "Nov", value: 40 },
  { month: "Dec", value: 55 },
]

const analyticsData = [
  { name: "Sales", value: 65, color: "#0052CC" },
  { name: "Pending", value: 20, color: "#B8B8FF" },
  { name: "Distribute", value: 15, color: "#D4D4D4" },
]

const recentCustomers = [
  { id: 1, name: "Tasha", orderId: "#5985", date: "8 sep, 2020", status: "On the way" },
  { id: 2, name: "Tasha", orderId: "#5985", date: "8 sep, 2020", status: "On the way" },
  { id: 3, name: "Tasha", orderId: "#5985", date: "8 sep, 2020", status: "On the way" },
  { id: 4, name: "Tasha", orderId: "#5985", date: "8 sep, 2020", status: "On the way" },
  { id: 5, name: "Tasha", orderId: "#5985", date: "8 sep, 2020", status: "On the way" },
]

const reviewOrders = [
  { order: "All", amount: 15 },
  { order: "Trash", amount: 6 },
  { order: "Pending", amount: 15 },
  { order: "Spam", amount: 3 },
]

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to your dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-100 to-blue-50 border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Earning</p>
                  <p className="text-2xl font-bold text-gray-900">$7,000.00</p>
                </div>
                <div className="bg-blue-200 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-500 border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100 mb-1">Total Order</p>
                  <p className="text-2xl font-bold text-white">$7,000.00</p>
                </div>
                <div className="bg-blue-400 p-3 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-400 border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100 mb-1">Total Provider</p>
                  <p className="text-2xl font-bold text-white">$7,000.00</p>
                </div>
                <div className="bg-blue-300 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300 mb-1">Total Admin Fees</p>
                  <p className="text-2xl font-bold text-white">$7,000.00</p>
                </div>
                <div className="bg-slate-600 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Total Payment Volume</CardTitle>
            <CardDescription>2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#0052CC" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>NOV 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {analyticsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {analyticsData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Range Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Total Order Range</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="value" fill="#0052CC" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Customer Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{customer.name}</td>
                      <td className="py-3 px-4 text-gray-600">{customer.orderId}</td>
                      <td className="py-3 px-4 text-gray-600">{customer.date}</td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {customer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviewOrders.map((item) => (
                <div key={item.order} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-gray-700">{item.order}</span>
                  <span className="font-semibold text-gray-900">{item.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

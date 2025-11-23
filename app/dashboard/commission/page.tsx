"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const commissions = [
  { id: 1, product: "Product 1", sales: 125, rate: "5%", amount: "$6.25", status: "Paid" },
  { id: 2, product: "Product 2", sales: 89, rate: "5%", amount: "$4.45", status: "Paid" },
  { id: 3, product: "Product 3", sales: 156, rate: "5%", amount: "$7.80", status: "Pending" },
  { id: 4, product: "Product 4", sales: 203, rate: "5%", amount: "$10.15", status: "Paid" },
  { id: 5, product: "Product 5", sales: 78, rate: "5%", amount: "$3.90", status: "Pending" },
]

export default function CommissionPage() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Commission</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">123</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Total Commissions</p>
            <p className="text-2xl font-bold text-gray-900">$12,345</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-1">Commission Rate</p>
            <p className="text-2xl font-bold text-gray-900">5%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Sales</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => (
                  <tr key={commission.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{commission.product}</td>
                    <td className="py-3 px-4 text-gray-600">{commission.sales}</td>
                    <td className="py-3 px-4 text-gray-600">{commission.rate}</td>
                    <td className="py-3 px-4 text-gray-900 font-semibold">{commission.amount}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          commission.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {commission.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

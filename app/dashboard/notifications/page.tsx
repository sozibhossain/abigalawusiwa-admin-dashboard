"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/toast-provider"

const notifications = [
  {
    id: 1,
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    description: "Your subscription is nearing its renewal date. Review and make adjustments if needed.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 2,
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    description: "We've noticed an unfamiliar login. Please verify your account activity",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    description: "Someone wants to connect with you! Review your invitation and grow your network.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 4,
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    description: "Here's a quick overview of your recent account activity for the past week.",
    time: "1 hour ago",
    read: true,
  },
  {
    id: 5,
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    description: "Scheduled maintenance is coming up. Expect temporary downtime during end.",
    time: "1 hour ago",
    read: true,
  },
]

const filterOptions = [
  { id: "comments", label: "Customer Comments", checked: true },
  { id: "likes", label: "User Likes", checked: false },
  { id: "reviews", label: "Product Reviews", checked: false },
  { id: "mentions", label: "User Mentions", checked: false },
  { id: "history", label: "Purchase History", checked: true },
]

export default function NotificationsPage() {
  const [notificationList, setNotificationList] = useState(notifications)
  const [filters, setFilters] = useState(filterOptions)
  const { addToast } = useToast()

  const handleMarkAllAsRead = () => {
    setNotificationList(notificationList.map((n) => ({ ...n, read: true })))
    addToast({
      title: "Marked all as read",
      type: "success",
    })
  }

  const handleClearAll = () => {
    setNotificationList([])
    addToast({
      title: "All notifications cleared",
      type: "success",
    })
  }

  const handleFilterChange = (id: string) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, checked: !f.checked } : f)))
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification</h1>
          <p className="text-gray-500">Stay Updated With Important Alerts and Reminders</p>
        </div>
        <Button onClick={handleMarkAllAsRead} className="bg-blue-600 hover:bg-blue-700">
          Mark all as read
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Notifications */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Notification</h2>
              <p className="text-sm text-gray-500">Your latest notifications and alerts</p>
            </div>

            <div className="divide-y divide-gray-200">
              {notificationList.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No notifications</div>
              ) : (
                notificationList.map((notification) => (
                  <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${notification.read ? "bg-gray-300" : "bg-blue-600"}`}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{notification.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button onClick={handleMarkAllAsRead} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Mark all
              </Button>
              <Button onClick={handleClearAll} variant="outline" className="flex-1 bg-transparent">
                Clear all
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Options</h3>
          <div className="space-y-3">
            {filters.map((filter) => (
              <label key={filter.id} className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={filter.checked} onCheckedChange={() => handleFilterChange(filter.id)} />
                <span className="text-sm text-gray-700">{filter.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { ChatSidebar, type Customer } from "@/components/chat-sidebar"
import { ChatWindow } from "@/components/chat-window"
import { useChat, type Conversation } from "@/hooks/use-chat"
import { useToast } from "@/components/toast-provider"

export default function MessagesPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  const { addToast } = useToast()

  const {
    messages,
    conversations,
    loading,
    fetchInbox,
    fetchMessages,
    sendMessage,
    startConversation,
  } = useChat(selectedConversation?._id)

  // Fetch inbox on mount
  useEffect(() => {
    fetchInbox()
  }, [fetchInbox])

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)

    // Find if conversation exists with this customer
    const existingConversation = conversations.find((conv) =>
      conv.participants.some((p) => p.user._id === customer._id),
    )

    if (existingConversation) {
      setSelectedConversation(existingConversation)
      fetchMessages(existingConversation._id)
    } else {
      setSelectedConversation(null)
    }
  }

// MessagesPage.tsx

const handleStartConversation = async (customer: Customer) => {
  try {
    const conversation = await startConversation(customer.storeId) // ⭐ storeId again
    setSelectedConversation(conversation)
    fetchMessages(conversation._id)

    addToast({
      title: "Conversation started",
      description: `Chat with ${customer.name}`,
      type: "success",
    })
  } catch (error) {
    console.error(error)
    addToast({
      title: "Failed to start conversation",
      type: "error",
    })
  }
}


  const handleSendMessage = async (text: string) => {
    if (!selectedConversation) return
    await sendMessage(text)
  }

  return (
    <div className="flex h-full bg-white gap-0">
      <ChatSidebar
        selectedCustomer={selectedCustomer}
        onSelectCustomer={handleSelectCustomer}
        onStartConversation={handleStartConversation}
      />
      <ChatWindow
        conversation={selectedConversation}
        messages={messages}
        loading={loading}
        onSendMessage={handleSendMessage}
      />
    </div>
  )
}

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
    isLoadingMessage,
    fetchInbox,
    fetchMessages,
    sendMessage,
    startConversation,
  } = useChat(selectedConversation?._id)

  // Fetch inbox on mount
  useEffect(() => {
    fetchInbox()
  }, [fetchInbox])

  // Start a conversation for a given customer
  const handleStartConversation = async (customer: Customer) => {
    if (!customer.storeId) {
      addToast({
        title: "Error",
        description: "Customer data is missing store ID to start conversation.",
        type: "error",
      })
      return
    }

    try {
      const conversation = await startConversation(customer.storeId)
      setSelectedConversation(conversation)
      await fetchMessages(conversation._id)

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

  // When a customer row is clicked
  // - if conversation exists for that store → open it
  // - else → create a conversation, then open it
  const handleSelectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer)

    // Prefer matching by store ID (vendor/store is what chat is keyed on)
    const existingConversation = conversations.find(
      (conv) => conv.store && conv.store._id === customer.storeId,
    )

    if (existingConversation) {
      setSelectedConversation(existingConversation)
      await fetchMessages(existingConversation._id)
    } else {
      await handleStartConversation(customer)
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
        isLoadingMessage={isLoadingMessage}
        onSendMessage={handleSendMessage}
      />
    </div>
  )
}

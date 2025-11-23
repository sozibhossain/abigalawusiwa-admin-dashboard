// hooks/use-chat.ts
"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { getSocket } from "@/lib/socket"
import { chatApi } from "@/lib/api"

export interface Message {
  _id: string
  sender: {
    _id: string
    name: string
    role?: string
    profileImage?: string
  }
  text: string
  files?: { url: string; fileType: string }[]
  createdAt: string
  // Optional: if your backend sends this, it helps filter socket events
  conversationId?: string
}

export interface Conversation {
  _id: string
  participants: Array<{
    user: { _id: string; name: string; profileImage?: string }
    lastRead?: string
  }>
  lastMessage?: {
    text: string
    sender: string
    createdAt: string
  }
  store: { _id: string; name: string; storeLogo?: string }
}

export const useChat = (conversationId?: string) => {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [isLoadingMessage, setIsLoadingMessage] = useState(false)

  // --- SOCKET SETUP ---
  useEffect(() => {
    if (!session) return

    const socket = getSocket()

    const handleConnect = () => {
      console.log("Socket connected:", socket.id)
      if (conversationId) {
        socket.emit("joinConversation", conversationId)
      }
    }

    const handleNewMessage = (message: Message) => {
      // If backend sends conversationId, ignore messages for other convos
      if (
        conversationId &&
        message.conversationId &&
        message.conversationId !== conversationId
      ) {
        return
      }

      setMessages((prev) => {
        // avoid duplicates if we already added optimistically
        if (prev.some((m) => m._id === message._id)) return prev
        return [...prev, message]
      })
    }

    socket.on("connect", handleConnect)
    socket.on("newMessage", handleNewMessage)

    // Join specific room when conversationId changes
    if (conversationId) {
      socket.emit("joinConversation", conversationId)
    }

    return () => {
      if (conversationId) {
        socket.emit("leaveConversation", conversationId)
      }
      socket.off("connect", handleConnect)
      socket.off("newMessage", handleNewMessage)
    }
  }, [session, conversationId])

  // --- API HELPERS ---

  const fetchInbox = useCallback(async () => {
    try {
      setLoading(true)
      const response = await chatApi.getInbox()
      setConversations(response.data.data || [])
    } catch (error) {
      console.error("Failed to fetch inbox:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMessages = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const response = await chatApi.getMessages(id)
      setMessages(response.data.data || [])
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const sendMessage = useCallback(
    async (text: string, files?: File[]) => {
      if (!conversationId) return

      setIsLoadingMessage(true)
      try {
        const response = await chatApi.sendMessage(conversationId, text, files)
        const newMessage: Message = response.data.data

        // optimistic update – in case socket is delayed or you don't echo to sender
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMessage._id)) return prev
          return [...prev, newMessage]
        })

        return newMessage
      } catch (error) {
        console.error("Failed to send message:", error)
        throw error
      } finally {
        setIsLoadingMessage(false)
      }
    },
    [conversationId],
  )

  const startConversation = useCallback(async (storeId: string) => {
    try {
      const response = await chatApi.startConversation(storeId)
      const conversation = response.data.data as Conversation

      // insert into inbox if not present
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === conversation._id)
        if (exists) {
          return prev.map((c) => (c._id === conversation._id ? conversation : c))
        }
        return [conversation, ...prev]
      })

      return conversation
    } catch (error) {
      console.error("Failed to start conversation:", error)
      throw error
    }
  }, [])

  return {
    messages,
    conversations,
    loading,
    isLoadingMessage,
    fetchInbox,
    fetchMessages,
    sendMessage,
    startConversation,
  }
}

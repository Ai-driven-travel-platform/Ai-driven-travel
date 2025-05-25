"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, X, Minimize2, User } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { ClientOnly } from "@/components/client-only"
import { useAuth } from "@/components/auth-provider"

// Message type aligned with API
interface Message {
  id: number
  content: string
  sender: "user" | "bot"
  created_at: string
}

// Quick reply type
interface QuickReply {
  id: string
  text: string
}

// API response types
interface ConversationHistoryResponse {
  id: number
  session_id: string
  created_at: string
  updated_at: string
  messages: Message[]
}

interface SendMessageResponse {
  session_id: string
  response: {
    content: string
    timestamp: string
  }
}

interface ErrorResponse {
  error: string
}

// API service
const API_BASE_URL = "https://ai-driven-travel.onrender.com/api/chatbot"

const apiService = {
  async getConversationHistory(sessionId: string, token: string): Promise<ConversationHistoryResponse> {
    const response = await fetch(`${API_BASE_URL}/message/history/?session_id=${sessionId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json()
      throw new Error(errorData.error || "Failed to fetch conversation history")
    }

    return response.json()
  },

  async sendMessage(
    message: string,
    sessionId: string | null,
    token: string
  ): Promise<SendMessageResponse> {
    const response = await fetch(`${API_BASE_URL}/message/message/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message, session_id: sessionId || undefined }),
    })

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json()
      throw new Error(errorData.error || "Failed to send message")
    }

    return response.json()
  },
}

// Parse markdown-like text to HTML with sanitization
const parseMarkdown = (text: string): string => {
  let formatted = text
    // Handle bold text (**text** or **text:**)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Handle bulleted lists (* text)
    .replace(/^\* (.*)$/gm, "<li>$1</li>")
    // Wrap lists in <ul>
    .replace(/(<li>.*<\/li>)/g, "<ul>$1</ul>")
    // Preserve newlines
    .replace(/\n/g, "<br />")
  // Basic sanitization to prevent XSS
  formatted = formatted.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
  return formatted
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isHumanRequested, setIsHumanRequested] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { user, isAuthenticated, isLoading } = useAuth()

  // Get access token
  const getAuthToken = () => {
    if (typeof window === "undefined") return null
    const localStorageToken = localStorage.getItem("access_token")
    if (localStorageToken && localStorageToken !== "undefined" && localStorageToken !== "null") {
      return localStorageToken
    }
    try {
      const cookies = document.cookie.split(";")
      const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith("access_token="))
      if (tokenCookie) {
        const token = tokenCookie.split("=")[1].trim()
        if (token && token !== "undefined" && token !== "null") {
          return token
        }
      }
    } catch (error) {
      console.error("Error retrieving access token:", error)
    }
    return null
  }

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Generate contextual quick replies
  const getContextualQuickReplies = (messageText: string): QuickReply[] => {
    if (messageText.includes("destinations") || messageText.includes("lalibela") || messageText.includes("gondar") || messageText.includes("axum") || messageText.includes("simien")) {
      return [
        { id: "lalibela", text: "Explore Lalibela" },
        { id: "gondar", text: "Explore Gondar" },
        { id: "axum", text: "Explore Axum" },
        { id: "simien", text: "Explore Simien Mountains" },
      ]
    } else if (messageText.includes("feedback")) {
      return [
        { id: "feedback-positive", text: "Share positive feedback" },
        { id: "feedback-issue", text: "Report an issue" },
        { id: "feedback-suggestion", text: "Suggest an improvement" },
      ]
    }
    return [
      { id: "destinations", text: "Popular destinations" },
      { id: "tours", text: "Tour packages" },
      { id: "accommodation", text: "Find accommodation" },
      { id: "transport", text: "Transportation options" },
    ]
  }

  // Send message to API with word-by-word typing effect
  const sendMessage = async (messageText: string) => {
    if (messageText.trim() === "") return

    const token = getAuthToken()
    if (!token) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: "**Please Log In**\n\nLog in to continue using the chatbot.",
          sender: "bot",
          created_at: new Date().toISOString(),
        },
      ])
      setQuickReplies([
        { id: "login", text: "Log in" },
        { id: "signup", text: "Sign up" },
        { id: "continue-browsing", text: "Continue browsing" },
      ])
      return
    }

    const userMessage: Message = {
      id: Date.now(),
      content: messageText,
      sender: "user",
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsTyping(true)

    // Initial delay before response
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      // Handle "Speak to a human" request
      if (messageText.toLowerCase().includes("speak to a human")) {
        setIsHumanRequested(true)
        const botMessage: Message = {
          id: Date.now() + 1,
          content:
            "**Human Support Request**\n\nI'm connecting you to our support team, available 9 AM–5 PM EAT. Please provide details for the agent (e.g., your query or contact info), or we'll follow up via email.",
          sender: "bot",
          created_at: new Date().toISOString(),
        }
        await simulateTyping(botMessage)
        setQuickReplies([
          { id: "details", text: "Provide details" },
          { id: "continue", text: "Continue with bot" },
          { id: "feedback", text: "Provide feedback" },
        ])
        setIsTyping(false)
        return
      }

      // Send message to API
      const response = await apiService.sendMessage(messageText, sessionId, token)
      setSessionId(response.session_id)
      localStorage.setItem("chat_session_id", response.session_id)

      const botMessage: Message = {
        id: Date.now() + 1,
        content: response.response.content,
        sender: "bot",
        created_at: response.response.timestamp,
      }

      // Simulate word-by-word typing
      await simulateTyping(botMessage)
      setQuickReplies(getContextualQuickReplies(messageText.toLowerCase()))
    } catch (error) {
      console.error("Error sending message:", error)
      let errorMessage = "**Connection Issue**\n\nI'm having trouble connecting right now. Please try again later."

      if (error instanceof Error) {
        if (error.message.includes("Rate limit exceeded")) {
          errorMessage = "**High Demand**\n\nWe're experiencing high demand. Please try again in a moment."
        } else if (error.message.includes("Invalid request data")) {
          errorMessage = "**Message Issue**\n\nThere was an issue with your message. Please try rephrasing."
        } else if (error.message.includes("Conversation belongs to another user")) {
          localStorage.removeItem("chat_session_id")
          setSessionId(null)
          errorMessage = "**Session Expired**\n\nSession expired. Please start a new conversation."
        }
      }

      const errorBotMessage: Message = {
        id: Date.now(),
        content: errorMessage,
        sender: "bot",
        created_at: new Date().toISOString(),
      }
      await simulateTyping(errorBotMessage)
      setQuickReplies([
        { id: "retry", text: "Try again" },
        { id: "help", text: "Get help" },
        { id: "continue-browsing", text: "Continue browsing" },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  // Simulate word-by-word typing effect
  const simulateTyping = async (message: Message) => {
    const words = message.content.split(" ")
    let currentText = ""
    for (let i = 0; i < words.length; i++) {
      currentText += words[i] + " "
      setMessages((prev) => {
        const updated = prev.filter((msg) => msg.id !== message.id)
        return [...updated, { ...message, content: currentText.trim() }]
      })
      await new Promise((resolve) => setTimeout(resolve, 100)) // 100ms delay per word
    }
    setMessages((prev) => {
      const updated = prev.filter((msg) => msg.id !== message.id)
      return [...updated, message]
    })
  }

  // Load conversation history
  const loadConversationHistory = async (token: string) => {
    const storedSessionId = localStorage.getItem("chat_session_id")
    if (!storedSessionId) return

    try {
      const history = await apiService.getConversationHistory(storedSessionId, token)
      setSessionId(history.session_id)
      setMessages(history.messages)
    } catch (error) {
      console.error("Error loading conversation history:", error)
      if (error instanceof Error) {
        if (
          error.message.includes("Conversation not found") ||
          error.message.includes("belongs to another user")
        ) {
          // Clear invalid session and start new conversation
          localStorage.removeItem("chat_session_id")
          setSessionId(null)
          setMessages([
            {
              id: Date.now(),
              content: "**Welcome back!**\n\nLet's start a new conversation. How can I help you plan your Ethiopian adventure today?",
              sender: "bot",
              created_at: new Date().toISOString(),
            },
          ])
          setQuickReplies([
            { id: "destinations", text: "Popular destinations" },
            { id: "tours", text: "Tour packages" },
            { id: "accommodation", text: "Find accommodation" },
            { id: "transport", text: "Transportation options" },
          ])
        }
      }
    }
  }

  // Initialize chat
  useEffect(() => {
    if (isLoading) return

    const initializeChat = async () => {
      const token = getAuthToken()

      if (!isAuthenticated || !token) {
        setMessages([
          {
            id: Date.now(),
            content:
              "**Welcome to EthioTravel Assistant!**\n\nPlease log in to access personalized travel assistance.",
            sender: "bot",
            created_at: new Date().toISOString(),
          },
        ])
        setQuickReplies([
          { id: "login", text: "Log in" },
          { id: "signup", text: "Sign up" },
          { id: "continue-browsing", text: "Continue browsing" },
        ])
        return
      }

      // Load conversation history
      await loadConversationHistory(token)

      // Set welcome message if no history
      if (messages.length === 0) {
        const welcomeMessage: Message = {
          id: Date.now(),
          content: `**Welcome${user?.first_name ? `, ${user.first_name}` : ""}!**\n\nHow can I help you plan your Ethiopian adventure today?`,
          sender: "bot",
          created_at: new Date().toISOString(),
        }
        await simulateTyping(welcomeMessage)
        setQuickReplies([
          { id: "destinations", text: "Popular destinations" },
          { id: "tours", text: "Tour packages" },
          { id: "accommodation", text: "Find accommodation" },
          { id: "transport", text: "Transportation options" },
        ])
      }
    }

    initializeChat()
  }, [isAuthenticated, isLoading, user])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
    }
  }, [messages, isOpen, isMinimized])

  const handleSendMessage = () => {
    sendMessage(message)
  }

  const handleQuickReplyClick = (replyId: string, replyText: string) => {
    if (replyId === "login") {
      window.location.href = "/login"
    } else if (replyId === "signup") {
      window.location.href = "/signup"
    } else if (replyId === "continue-browsing") {
      toggleChat()
    } else if (replyId === "continue" && isHumanRequested) {
      setIsHumanRequested(false)
      const continueMessage: Message = {
        id: Date.now(),
        content: "**Let's continue!**\n\nHow can I assist you with your Ethiopian adventure?",
        sender: "bot",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, continueMessage])
      setQuickReplies([
        { id: "destinations", text: "Popular destinations" },
        { id: "tours", text: "Tour packages" },
        { id: "accommodation", text: "Find accommodation" },
        { id: "transport", text: "Transportation options" },
      ])
    } else if (replyId === "details" && isHumanRequested) {
      const detailsMessage: Message = {
        id: Date.now(),
        content:
          "**Support Details**\n\nPlease provide details for our support team (e.g., your query or contact info), and we'll follow up soon.",
        sender: "bot",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, detailsMessage])
      setQuickReplies([
        { id: "continue", text: "Continue with bot" },
        { id: "feedback", text: "Provide feedback" },
      ])
    } else {
      sendMessage(replyText)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isTyping && message.trim() !== "") {
      handleSendMessage()
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
    if (!isOpen && isAuthenticated) {
      const token = getAuthToken()
      if (token) loadConversationHistory(token)
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <ClientOnly>
      <div className="fixed bottom-6 right-6 z-50">
        {isOpen && (
          <div
            className={`bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md h-[calc(100vh-120px)] max-h-[600px] transition-all duration-300 ease-in-out ${
              isMinimized ? "h-16" : ""
            }`}
          >
            {/* Attractive Close Bar */}
            

            {/* Header with Title and Minimize Button */}
            <div className="bg-primary text-white  h-12 p-3 flex items-center justify-between w-full border-b border-white/20 flex-shrink-0">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                <h3 className="font-bold text-base">EthioTravel Assistant</h3>
              </div>
              <div
              className="bg-primary text-white p-3 flex items-center justify-center cursor-pointer hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-md sticky top-0 z-10"
              onClick={toggleChat}
              role="button"
              aria-label="Close chat"
            >
              <X className="h-5 w-5 mr-2" />
              <span className="font-semibold text-sm"></span>
            </div>
            </div>

            {!isMinimized && (
              <>
                <div className="flex flex-col h-full">
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50" style={{ height: "calc(100% - 80px)" }}>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`mb-4 flex ${
                          msg.sender === "user" ? "justify-end" : "justify-start"
                        } items-start gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto" : "mr-auto"}`}
                      >
                        {msg.sender === "bot" && (
                          <Avatar className="h-8 w-8 bg-primary text-white shadow-sm mt-1">
                            <MessageSquare className="h-4 w-4" />
                          </Avatar>
                        )}
                        <div
                          className={`rounded-lg px-4 py-2 shadow-sm ${
                            msg.sender === "user"
                              ? "bg-primary text-white"
                              : "bg-white text-gray-800"
                          }`}
                        >
                          <div
                            className="text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                          />
                          <p className="text-xs mt-1 opacity-70 text-right">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {msg.sender === "user" && (
                          <Avatar className="h-8 w-8 bg-gray-300 shadow-sm mt-1">
                            <User className="h-4 w-4" />
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex items-center space-x-2 justify-start">
                        <Avatar className="h-8 w-8 bg-primary text-white shadow-sm">
                          <MessageSquare className="h-4 w-4" />
                        </Avatar>
                        <div className="bg-white text-gray-800 rounded-lg px-4 py-2 shadow-sm">
                          <div className="flex space-x-1">
                            <div
                              className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                            <div
                              className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "600ms" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {quickReplies.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {quickReplies.map((reply) => (
                          <button
                            key={reply.id}
                            onClick={() => handleQuickReplyClick(reply.id, reply.text)}
                            className="bg-white hover:bg-gray-100 text-gray-800 text-xs py-2 px-3 rounded-md shadow-sm border border-gray-200 transition-colors text-left"
                          >
                            {reply.text}
                          </button>
                        ))}
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  <div className="border-t p-4 mb-10 bg-white mt-auto">
                    <div className="flex items-center gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-grow shadow-sm text-sm"
                        disabled={isTyping}
                      />
                      <Button
                        onClick={handleSendMessage}
                        size="icon"
                        disabled={message.trim() === "" || isTyping}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {!isOpen && (
          <Button
            onClick={toggleChat}
            className="rounded-full h-16 w-16 shadow-xl flex items-center justify-center bg-primary hover:bg-primary/90"
            size="icon"
            aria-label="Open chat"
          >
            <MessageSquare className="h-7 w-7" />
            <span className="absolute top-0 right-0 h-3 w-3 bg-green-500 rounded-full"></span>
          </Button>
        )}
      </div>
    </ClientOnly>
  )
}
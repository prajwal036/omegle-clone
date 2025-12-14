'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  message: string
  from?: string
  timestamp: string
  isOwn?: boolean
}

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  isWaiting: boolean
  isChatting: boolean
  matchedSocketId: string | null
  messages: Message[]
  startChat: () => void
  sendMessage: (message: string) => void
  disconnectChat: () => void
  error: string | null
}

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [isChatting, setIsChatting] = useState(false)
  const [matchedSocketId, setMatchedSocketId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize socket connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
      setError(null)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
      setIsWaiting(false)
      setIsChatting(false)
      setMatchedSocketId(null)
    })

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err)
      setError('Failed to connect to server')
      setIsConnected(false)
    })

    // Chat events
    newSocket.on('waiting', () => {
      console.log('Waiting for a match...')
      setIsWaiting(true)
      setIsChatting(false)
      setMatchedSocketId(null)
      setMessages([])
    })

    newSocket.on('matched', (data: { matchedSocketId: string }) => {
      console.log('Matched with:', data.matchedSocketId)
      setIsWaiting(false)
      setIsChatting(true)
      setMatchedSocketId(data.matchedSocketId)
      setMessages([])
      setError(null)
    })

    newSocket.on('receive-message', (data: { message: string; from: string; timestamp: string }) => {
      console.log('Received message:', data)
      setMessages((prev) => [
        ...prev,
        {
          message: data.message,
          from: data.from,
          timestamp: data.timestamp,
          isOwn: false,
        },
      ])
    })

    newSocket.on('message-sent', (data: { message: string; timestamp: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          message: data.message,
          timestamp: data.timestamp,
          isOwn: true,
        },
      ])
    })

    newSocket.on('partner-disconnected', () => {
      console.log('Partner disconnected')
      setIsChatting(false)
      setIsWaiting(false)
      setMatchedSocketId(null)
      setMessages((prev) => [
        ...prev,
        {
          message: 'Stranger has disconnected.',
          timestamp: new Date().toISOString(),
          isOwn: false,
        },
      ])
    })

    newSocket.on('disconnected', () => {
      setIsChatting(false)
      setIsWaiting(false)
      setMatchedSocketId(null)
    })

    newSocket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message)
      setError(data.message)
    })

    // Cleanup on unmount
    return () => {
      newSocket.close()
      socketRef.current = null
    }
  }, [])

  const startChat = () => {
    if (socket && isConnected) {
      setError(null)
      setMessages([])
      socket.emit('start-chat')
    } else {
      setError('Not connected to server')
    }
  }

  const sendMessage = (message: string) => {
    if (socket && isChatting && matchedSocketId && message.trim()) {
      socket.emit('send-message', {
        message: message.trim(),
        matchedSocketId,
      })
    }
  }

  const disconnectChat = () => {
    if (socket) {
      socket.emit('disconnect-chat')
      setIsChatting(false)
      setIsWaiting(false)
      setMatchedSocketId(null)
    }
  }

  return {
    socket,
    isConnected,
    isWaiting,
    isChatting,
    matchedSocketId,
    messages,
    startChat,
    sendMessage,
    disconnectChat,
    error,
  }
}


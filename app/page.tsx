"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSocket } from "@/hooks/useSocket";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Send, X, Loader2 } from "lucide-react";

export default function Home() {
  const {
    isConnected,
    isWaiting,
    isChatting,
    matchedSocketId,
    messages,
    startChat,
    sendMessage,
    disconnectChat,
    error,
  } = useSocket();

  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && isChatting) {
      sendMessage(messageInput);
      setMessageInput("");
    }
  };

  const handleStartChat = () => {
    startChat();
  };

  const handleDisconnect = () => {
    disconnectChat();
    setMessageInput("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Omgle Clone</CardTitle>
              <CardDescription>
                {!isConnected && "Connecting..."}
                {isConnected &&
                  !isWaiting &&
                  !isChatting &&
                  'Click "Start Chat" to begin'}
                {isWaiting && "Searching for a stranger..."}
                {isChatting && "You are chatting with a stranger"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
                title={isConnected ? "Connected" : "Disconnected"}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {!isChatting && !isWaiting ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="p-6 rounded-full bg-primary/10">
                <MessageSquare className="h-16 w-16 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Ready to chat?</h2>
                <p className="text-muted-foreground max-w-md">
                  Click the button below to connect with a random stranger from
                  anywhere in the world. No registration required!
                </p>
              </div>
              <Button
                onClick={handleStartChat}
                disabled={!isConnected}
                size="lg"
                className="px-8"
              >
                {!isConnected ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Start Chat"
                )}
              </Button>
            </div>
          ) : isWaiting ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">
                  Searching for a stranger...
                </h2>
                <p className="text-muted-foreground">
                  Please wait while we find someone to chat with.
                </p>
              </div>
              <Button onClick={handleDisconnect} variant="outline" size="lg">
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex flex-col h-[500px]">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-muted/30 rounded-lg">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Start the conversation...</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          msg.isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.isOwn
                              ? "text-primary-foreground/70"
                              : "text-secondary-foreground/70"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={!isChatting}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={!isChatting || !messageInput.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  onClick={handleDisconnect}
                  variant="destructive"
                  size="icon"
                  disabled={!isChatting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

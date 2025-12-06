import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  modelUsed?: "gemini" | "openai" | "claude";
  taskType?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastMessageAt: Date;
}

const CHAT_HISTORY_KEY = "@contractoros_chat_history";
const MAX_SESSIONS = 50;

export const [AIChatProvider, useAIChat] = createContextHook(() => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const sessionsWithDates = parsed.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          lastMessageAt: new Date(session.lastMessageAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setSessions(sessionsWithDates);
        console.log("[AIChat] Loaded", sessionsWithDates.length, "sessions");
      }
    } catch (error) {
      console.error("[AIChat] Failed to load chat history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveChatHistory = async (newSessions: ChatSession[]) => {
    try {
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(newSessions));
      console.log("[AIChat] Saved", newSessions.length, "sessions");
    } catch (error) {
      console.error("[AIChat] Failed to save chat history:", error);
    }
  };

  const createNewSession = (initialMessage?: ChatMessage): string => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: initialMessage?.content.slice(0, 50) || "New Conversation",
      messages: initialMessage ? [initialMessage] : [],
      createdAt: new Date(),
      lastMessageAt: new Date(),
    };

    let updatedSessions = [newSession, ...sessions];
    
    if (updatedSessions.length > MAX_SESSIONS) {
      updatedSessions = updatedSessions.slice(0, MAX_SESSIONS);
    }

    setSessions(updatedSessions);
    setCurrentSessionId(newSession.id);
    saveChatHistory(updatedSessions);

    return newSession.id;
  };

  const addMessage = (sessionId: string, message: ChatMessage) => {
    setSessions((prevSessions) => {
      const updatedSessions = prevSessions.map((session) => {
        if (session.id === sessionId) {
          return {
            ...session,
            messages: [...session.messages, message],
            lastMessageAt: new Date(),
            title: session.messages.length === 0 ? message.content.slice(0, 50) : session.title,
          };
        }
        return session;
      });

      saveChatHistory(updatedSessions);
      return updatedSessions;
    });
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prevSessions) => {
      const updatedSessions = prevSessions.filter((s) => s.id !== sessionId);
      saveChatHistory(updatedSessions);
      
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }

      return updatedSessions;
    });
  };

  const clearAllHistory = async () => {
    try {
      await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
      setSessions([]);
      setCurrentSessionId(null);
      console.log("[AIChat] Cleared all history");
    } catch (error) {
      console.error("[AIChat] Failed to clear history:", error);
    }
  };

  const getCurrentSession = (): ChatSession | null => {
    if (!currentSessionId) return null;
    return sessions.find((s) => s.id === currentSessionId) || null;
  };

  return {
    sessions,
    currentSessionId,
    isLoading,
    createNewSession,
    addMessage,
    deleteSession,
    clearAllHistory,
    getCurrentSession,
    setCurrentSessionId,
  };
});

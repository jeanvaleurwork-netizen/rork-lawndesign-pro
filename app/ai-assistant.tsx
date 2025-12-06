import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Modal,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { Send, Bot, User as UserIcon, MessageSquare, Trash2, Plus, History as HistoryIcon, Sparkles } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { useAIChat, ChatMessage } from "@/contexts/AIChatContext";

import Colors from "@/constants/colors";

type TaskMode = "generic_chat" | "job_costing" | "estimate_generation" | "contract_generation" | "customer_message" | "crew_instructions" | "scheduling_optimization";

const TASK_MODES = [
  { id: "generic_chat" as TaskMode, label: "General", icon: MessageSquare },
  { id: "job_costing" as TaskMode, label: "Job Costing", icon: Sparkles },
  { id: "estimate_generation" as TaskMode, label: "Estimates", icon: Sparkles },
  { id: "contract_generation" as TaskMode, label: "Contracts", icon: Sparkles },
  { id: "scheduling_optimization" as TaskMode, label: "Scheduling", icon: Sparkles },
];

export default function AIAssistantScreen() {
  const { user } = useAuth();
  const { 
    sessions,
    currentSessionId,
    createNewSession,
    addMessage,
    deleteSession,
    getCurrentSession,
    setCurrentSessionId,
  } = useAIChat();
  
  const [inputText, setInputText] = useState<string>("");
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [taskMode, setTaskMode] = useState<TaskMode>("generic_chat");
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const currentSession = getCurrentSession();
  const messages = currentSession?.messages || [];

  const aiOfficeMutation = trpc.ai.officeManager.useMutation();

  useEffect(() => {
    if (messages.length > 0 && !currentSessionId) {
      return;
    }
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, currentSessionId]);

  useEffect(() => {
    if (messages.length === 0 && !currentSessionId) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: user?.role === "crew" 
          ? "Hi! I'm your AI Crew Assistant. I can help you with task instructions, safety guidelines, and job details. How can I help you today?" 
          : "Hi! I'm your AI Office Manager. I can help you with estimates, job costing, contracts, scheduling, and more. What can I help you with today?",
        timestamp: new Date(),
      };
      
      const sessionId = createNewSession(welcomeMessage);
      setCurrentSessionId(sessionId);
    }
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || aiOfficeMutation.isPending) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createNewSession();
      setCurrentSessionId(sessionId);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
      timestamp: new Date(),
    };

    addMessage(sessionId, userMessage);
    const currentInput = inputText;
    setInputText("");

    try {
      const result = await aiOfficeMutation.mutateAsync({
        message: currentInput,
        role: (user?.role === "admin" || user?.role === "crew" ? user.role : "admin") as "admin" | "crew",
        taskType: taskMode,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.message,
        timestamp: new Date(),
        modelUsed: result.modelUsed,
        taskType: result.taskType,
      };
      
      addMessage(sessionId, aiResponse);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      
      addMessage(sessionId, errorMessage);
      console.error("[AI Assistant] Error:", error);
    }
  };

  const handleNewChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: user?.role === "crew" 
        ? "Hi! I'm your AI Crew Assistant. How can I help you today?" 
        : "Hi! I'm your AI Office Manager. What can I help you with?",
      timestamp: new Date(),
    };
    const sessionId = createNewSession(welcomeMessage);
    setCurrentSessionId(sessionId);
    setShowHistory(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this conversation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSession(sessionId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (currentSessionId === sessionId) {
              handleNewChat();
            }
          },
        },
      ]
    );
  };



  const quickActions = user?.role === "crew" 
    ? [
        "What are my tasks today?",
        "Show me job location",
        "Safety checklist",
        "Report an issue",
      ]
    : [
        "Create an estimate",
        "Analyze job costs",
        "Generate a contract",
        "Check today's schedule",
      ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: user?.role === "crew" ? "AI Crew Assistant" : "AI Office Manager",
          headerStyle: { backgroundColor: Colors.light.card },
          headerTintColor: Colors.light.text,
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 12, marginRight: 8 }}>
              <TouchableOpacity onPress={() => setShowHistory(true)}>
                <HistoryIcon color={Colors.light.text} size={22} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNewChat}>
                <Plus color={Colors.light.text} size={22} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.messagesContainer}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.role === "user" ? styles.userMessageWrapper : styles.assistantMessageWrapper,
              ]}
            >
              <View
                style={[
                  styles.messageIconContainer,
                  message.role === "user" ? styles.userIconContainer : styles.assistantIconContainer,
                ]}
              >
                {message.role === "user" ? (
                  <UserIcon color="#FFF" size={16} />
                ) : (
                  <Bot color="#FFF" size={16} />
                )}
              </View>
              <View
                style={[
                  styles.messageBubble,
                  message.role === "user" ? styles.userMessage : styles.assistantMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === "user" ? styles.userMessageText : styles.assistantMessageText,
                  ]}
                >
                  {message.content}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    message.role === "user" ? styles.userTimestamp : styles.assistantTimestamp,
                  ]}
                >
                  {message.timestamp.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          ))}

          {aiOfficeMutation.isPending && (
            <View style={[styles.messageWrapper, styles.assistantMessageWrapper]}>
              <View style={[styles.messageIconContainer, styles.assistantIconContainer]}>
                <Bot color="#FFF" size={16} />
              </View>
              <View style={[styles.messageBubble, styles.assistantMessage]}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            </View>
          )}

          {messages.length === 1 && (
            <View style={styles.quickActionsContainer}>
              <Text style={styles.quickActionsTitle}>Quick Actions:</Text>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickActionButton}
                  onPress={() => {
                    setInputText(action);
                    setTimeout(() => handleSend(), 100);
                  }}
                >
                  <Text style={styles.quickActionText}>{action}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputSection}>
          {user?.role === "admin" && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.taskModeScroll}>
              <View style={styles.taskModeContainer}>
                {TASK_MODES.map((mode) => (
                  <TouchableOpacity
                    key={mode.id}
                    style={[styles.taskModeChip, taskMode === mode.id && styles.taskModeChipActive]}
                    onPress={() => {
                      setTaskMode(mode.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <mode.icon 
                      color={taskMode === mode.id ? "#FFF" : Colors.light.primary} 
                      size={14} 
                    />
                    <Text style={[styles.taskModeText, taskMode === mode.id && styles.taskModeTextActive]}>
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={user?.role === "crew" ? "Ask about your tasks..." : "Ask me anything..."}
              placeholderTextColor={Colors.light.muted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!aiOfficeMutation.isPending}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || aiOfficeMutation.isPending) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || aiOfficeMutation.isPending}
            >
              {aiOfficeMutation.isPending ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Send color={!inputText.trim() ? Colors.light.muted : "#FFF"} size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={showHistory} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chat History</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.historyList}>
              {sessions.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  style={[
                    styles.historyItem,
                    currentSessionId === session.id && styles.historyItemActive,
                  ]}
                  onPress={() => {
                    setCurrentSessionId(session.id);
                    setShowHistory(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <View style={styles.historyItemContent}>
                    <Text style={styles.historyItemTitle} numberOfLines={1}>
                      {session.title}
                    </Text>
                    <Text style={styles.historyItemSubtitle}>
                      {session.messages.length} messages • {session.lastMessageAt.toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSession(session.id)}
                  >
                    <Trash2 color={Colors.light.error} size={18} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
              <Plus color="#FFF" size={20} />
              <Text style={styles.newChatButtonText}>New Conversation</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  messagesContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  messageWrapper: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userMessageWrapper: {
    justifyContent: "flex-end",
  },
  assistantMessageWrapper: {
    justifyContent: "flex-start",
  },
  messageIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  userIconContainer: {
    backgroundColor: Colors.light.primary,
  },
  assistantIconContainer: {
    backgroundColor: Colors.light.secondary,
  },
  messageBubble: {
    maxWidth: "70%",
    borderRadius: 16,
    padding: 12,
  },
  userMessage: {
    backgroundColor: Colors.light.primary,
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: "#FFF",
  },
  assistantMessageText: {
    color: Colors.light.text,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  assistantTimestamp: {
    color: Colors.light.muted,
  },
  typingIndicator: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.muted,
  },
  quickActionsContainer: {
    marginTop: 16,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  quickActionButton: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  quickActionText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.light.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light.background,
  },
  inputSection: {
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  taskModeScroll: {
    maxHeight: 50,
  },
  taskModeContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  taskModeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    gap: 6,
  },
  taskModeChipActive: {
    backgroundColor: Colors.light.primary,
  },
  taskModeText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  taskModeTextActive: {
    color: "#FFF",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  historyItemActive: {
    backgroundColor: Colors.light.card,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  historyItemSubtitle: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  deleteButton: {
    padding: 8,
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  newChatButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});

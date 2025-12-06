import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Send, Bot, User as UserIcon } from "lucide-react-native";
import { trpc } from "@/lib/trpc";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface IntakeData {
  jobType?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  description?: string;
  urgency?: number;
  photos?: string[];
  answers?: Record<string, string>;
}

export default function CustomerIntakeScreen() {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [conversation, setConversation] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your ContractorOS AI assistant. I'm here to help you schedule a service. What type of service do you need today?",
    },
  ]);
  const [intakeData, setIntakeData] = useState<IntakeData>({});
  const [intakeId] = useState<string>(`intake-${Date.now()}`);

  const processMessageMutation = trpc.aiIntake.processMessage.useMutation({
    onSuccess: (response) => {
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.message,
        },
      ]);

      if (response.extractedData) {
        setIntakeData(response.extractedData as IntakeData);
      }

      if (response.nextAction === "complete") {
        setTimeout(() => {
          handleComplete();
        }, 1500);
      }
    },
    onError: (error) => {
      console.error("[Customer Intake] Error:", error);
      const errorMessage = error?.message || "Unknown error";
      
      let userFriendlyMessage = "I'm sorry, I encountered an error. Please try again.";
      
      if (errorMessage.includes("404")) {
        userFriendlyMessage = "The AI assistant backend is currently starting up. Please wait a moment and try again. If this persists, please contact support.";
      } else if (errorMessage.includes("Failed to fetch") || errorMessage.includes("Network")) {
        userFriendlyMessage = "Unable to connect to the server. Please check your internet connection and try again.";
      }
      
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: userFriendlyMessage,
        },
      ]);
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) {
      return;
    }

    const userMessage = message.trim();
    setMessage("");

    setConversation((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    processMessageMutation.mutate({
      intakeId,
      message: userMessage,
      conversationHistory: conversation,
      currentData: intakeData,
    });
  };

  const handleComplete = () => {
    if (
      !intakeData.jobType ||
      !intakeData.customerName ||
      !intakeData.address
    ) {
      return;
    }

    const route = `/intake-summary?intakeId=${intakeId}&data=${encodeURIComponent(JSON.stringify(intakeData))}`;
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Service Request",
          headerStyle: {
            backgroundColor: "#007AFF",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600" as const,
          },
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {conversation.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageRow,
                msg.role === "user" ? styles.userRow : styles.assistantRow,
              ]}
            >
              <View
                style={[
                  styles.messageAvatar,
                  msg.role === "user"
                    ? styles.userAvatar
                    : styles.assistantAvatar,
                ]}
              >
                {msg.role === "user" ? (
                  <UserIcon size={18} color="#fff" />
                ) : (
                  <Bot size={18} color="#fff" />
                )}
              </View>
              <View
                style={[
                  styles.messageBubble,
                  msg.role === "user"
                    ? styles.userBubble
                    : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.role === "user" && styles.userText,
                  ]}
                >
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}

          {processMessageMutation.isPending && (
            <View style={[styles.messageRow, styles.assistantRow]}>
              <View style={[styles.messageAvatar, styles.assistantAvatar]}>
                <Bot size={18} color="#fff" />
              </View>
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <ActivityIndicator color="#007AFF" />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || processMessageMutation.isPending) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim() || processMessageMutation.isPending}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {intakeData.jobType && (
        <View style={styles.progressBar}>
          <View style={styles.progressItem}>
            <View style={styles.progressDot} />
            <Text style={styles.progressText}>
              {intakeData.jobType.replace("_", " ").toUpperCase()}
            </Text>
          </View>
          {intakeData.phone && (
            <View style={styles.progressItem}>
              <View style={styles.progressDot} />
              <Text style={styles.progressText}>Contact Info</Text>
            </View>
          )}
          {intakeData.address && (
            <View style={styles.progressItem}>
              <View style={styles.progressDot} />
              <Text style={styles.progressText}>Address</Text>
            </View>
          )}
          {intakeData.urgency && (
            <View style={styles.progressItem}>
              <View style={styles.progressDot} />
              <Text style={styles.progressText}>Urgency Set</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 80,
  },
  messageRow: {
    flexDirection: "row" as const,
    marginBottom: 16,
    alignItems: "flex-end" as const,
  },
  userRow: {
    justifyContent: "flex-end" as const,
  },
  assistantRow: {
    justifyContent: "flex-start" as const,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginHorizontal: 8,
  },
  userAvatar: {
    backgroundColor: "#007AFF",
  },
  assistantAvatar: {
    backgroundColor: "#34C759",
  },
  messageBubble: {
    maxWidth: "70%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#333",
  },
  userText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row" as const,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "center" as const,
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    color: "#333",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007AFF",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  progressBar: {
    flexDirection: "row" as const,
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexWrap: "wrap" as const,
  },
  progressItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginRight: 16,
    marginVertical: 4,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34C759",
    marginRight: 6,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500" as const,
  },
});

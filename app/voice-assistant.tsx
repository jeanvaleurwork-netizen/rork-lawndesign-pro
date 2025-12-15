import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  CheckCircle,
  AlertCircle,
  Loader,
  User,
  MessageSquare,
} from "lucide-react-native";
import { useVoiceCall } from "@/contexts/VoiceCallContext";

export default function VoiceAssistantScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  
  const {
    callState,
    conversation,
    callData,
    error,
    startRecording,
    stopRecording,
    startCall,
    resetCall,
    isRecording,
    isProcessing,
    isCompleted,
  } = useVoiceCall();

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  useEffect(() => {
    if (conversation.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [conversation]);

  const handleStartCall = async () => {
    await startCall();
  };

  const handleEndCall = () => {
    resetCall();
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleViewLeads = () => {
    router.push("/phone-intake-dashboard");
  };

  const getStateMessage = () => {
    switch (callState) {
      case "idle":
        return "Tap the microphone to speak";
      case "recording":
        return "Listening...";
      case "processing":
        return "Processing your response...";
      case "speaking":
        return "AI is speaking...";
      case "completed":
        return "Call completed!";
      case "error":
        return error || "An error occurred";
      default:
        return "";
    }
  };

  const getStateColor = () => {
    switch (callState) {
      case "recording":
        return "#FF3B30";
      case "processing":
        return "#FF9500";
      case "completed":
        return "#34C759";
      case "error":
        return "#FF3B30";
      default:
        return "#007AFF";
    }
  };

  const hasActiveCall = conversation.length > 0;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Phone size={28} color="#fff" />
              <Text style={styles.headerTitle}>AI Phone Assistant</Text>
            </View>
            {hasActiveCall && !isCompleted && (
              <TouchableOpacity
                style={styles.endCallButton}
                onPress={handleEndCall}
              >
                <PhoneOff size={20} color="#FF3B30" />
                <Text style={styles.endCallText}>End</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.conversationContainer}
            contentContainerStyle={styles.conversationContent}
            showsVerticalScrollIndicator={false}
          >
            {!hasActiveCall ? (
              <View style={styles.welcomeContainer}>
                <View style={styles.welcomeIconContainer}>
                  <Phone size={64} color="#007AFF" />
                </View>
                <Text style={styles.welcomeTitle}>
                  AI-Powered Customer Intake
                </Text>
                <Text style={styles.welcomeDescription}>
                  Our AI assistant will help collect customer information, identify
                  service needs, and create structured leads automatically.
                </Text>
                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <CheckCircle size={20} color="#34C759" />
                    <Text style={styles.featureText}>
                      Automatic trade detection
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <CheckCircle size={20} color="#34C759" />
                    <Text style={styles.featureText}>
                      Real-time speech-to-text
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <CheckCircle size={20} color="#34C759" />
                    <Text style={styles.featureText}>
                      Intelligent question flow
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <CheckCircle size={20} color="#34C759" />
                    <Text style={styles.featureText}>
                      Structured lead creation
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <>
                {conversation.map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.messageContainer,
                      message.role === "user"
                        ? styles.userMessage
                        : styles.assistantMessage,
                    ]}
                  >
                    <View style={styles.messageHeader}>
                      {message.role === "user" ? (
                        <User size={18} color="#007AFF" />
                      ) : (
                        <MessageSquare size={18} color="#34C759" />
                      )}
                      <Text style={styles.messageRole}>
                        {message.role === "user" ? "You" : "AI Assistant"}
                      </Text>
                    </View>
                    <Text style={styles.messageText}>{message.content}</Text>
                    <Text style={styles.messageTime}>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                ))}

                {isProcessing && (
                  <View style={styles.loadingContainer}>
                    <Loader size={20} color="#FF9500" />
                    <Text style={styles.loadingText}>Processing...</Text>
                  </View>
                )}
              </>
            )}

            {isCompleted && (
              <View style={styles.completionCard}>
                <CheckCircle size={48} color="#34C759" />
                <Text style={styles.completionTitle}>
                  Call Completed Successfully!
                </Text>
                <Text style={styles.completionDescription}>
                  The lead has been created and saved to your dashboard.
                </Text>
                {callData.customerName && (
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Summary</Text>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Customer:</Text>
                      <Text style={styles.summaryValue}>
                        {callData.customerName}
                      </Text>
                    </View>
                    {callData.phone && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Phone:</Text>
                        <Text style={styles.summaryValue}>
                          {callData.phone}
                        </Text>
                      </View>
                    )}
                    {callData.jobType && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Service:</Text>
                        <Text style={styles.summaryValue}>
                          {callData.jobType}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                <TouchableOpacity
                  style={styles.viewLeadsButton}
                  onPress={handleViewLeads}
                >
                  <Text style={styles.viewLeadsText}>View All Leads</Text>
                </TouchableOpacity>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={24} color="#FF3B30" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.controlsContainer}>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStateColor() },
                ]}
              />
              <Text style={styles.statusText}>{getStateMessage()}</Text>
            </View>

            {!hasActiveCall ? (
              <TouchableOpacity
                style={styles.startCallButton}
                onPress={handleStartCall}
              >
                <Phone size={28} color="#fff" />
                <Text style={styles.startCallText}>Start Call</Text>
              </TouchableOpacity>
            ) : !isCompleted ? (
              <View style={styles.recordingControls}>
                <Animated.View
                  style={[
                    styles.micButtonContainer,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.micButton,
                      isRecording && styles.micButtonActive,
                      isProcessing && styles.micButtonDisabled,
                    ]}
                    onPress={handleToggleRecording}
                    disabled={isProcessing}
                  >
                    {isRecording ? (
                      <MicOff size={40} color="#fff" />
                    ) : (
                      <Mic size={40} color="#fff" />
                    )}
                  </TouchableOpacity>
                </Animated.View>
                <Text style={styles.micHint}>
                  {isRecording
                    ? "Tap to stop speaking"
                    : "Tap to start speaking"}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.newCallButton}
                onPress={handleStartCall}
              >
                <Phone size={24} color="#fff" />
                <Text style={styles.newCallText}>Start New Call</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
  },
  endCallButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: "rgba(255, 59, 48, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  endCallText: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  conversationContainer: {
    flex: 1,
  },
  conversationContent: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeContainer: {
    alignItems: "center" as const,
    paddingTop: 40,
  },
  welcomeIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0, 122, 255, 0.15)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 12,
    textAlign: "center" as const,
  },
  welcomeDescription: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center" as const,
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  featuresList: {
    width: "100%",
    gap: 16,
  },
  featureItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500" as const,
  },
  messageContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    backgroundColor: "rgba(0, 122, 255, 0.2)",
    alignSelf: "flex-end" as const,
    maxWidth: "85%",
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: "rgba(52, 199, 89, 0.2)",
    alignSelf: "flex-start" as const,
    maxWidth: "85%",
    borderBottomLeftRadius: 4,
  },
  messageHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 8,
  },
  messageRole: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "rgba(255, 255, 255, 0.9)",
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 24,
    marginBottom: 8,
  },
  messageTime: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
  loadingContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    padding: 16,
    backgroundColor: "rgba(255, 149, 0, 0.2)",
    borderRadius: 12,
    alignSelf: "flex-start" as const,
  },
  loadingText: {
    fontSize: 16,
    color: "#FF9500",
    fontWeight: "500" as const,
  },
  completionCard: {
    alignItems: "center" as const,
    padding: 24,
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#34C759",
    marginTop: 20,
  },
  completionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center" as const,
  },
  completionDescription: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center" as const,
    marginBottom: 24,
  },
  summaryCard: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  summaryValue: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500" as const,
  },
  viewLeadsButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  viewLeadsText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  errorContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    padding: 16,
    backgroundColor: "rgba(255, 59, 48, 0.2)",
    borderRadius: 12,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "500" as const,
    flex: 1,
  },
  controlsContainer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  statusContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    marginBottom: 24,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500" as const,
  },
  startCallButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 12,
    backgroundColor: "#34C759",
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  startCallText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
  },
  recordingControls: {
    alignItems: "center" as const,
    gap: 16,
  },
  micButtonContainer: {
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  micButtonActive: {
    backgroundColor: "#FF3B30",
  },
  micButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.5,
  },
  micHint: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center" as const,
  },
  newCallButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 12,
    backgroundColor: "#007AFF",
    paddingVertical: 18,
    borderRadius: 16,
  },
  newCallText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
  },
});

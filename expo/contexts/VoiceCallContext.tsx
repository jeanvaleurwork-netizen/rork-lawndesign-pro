import { useState, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { Audio } from "expo-av";
import { Platform } from "react-native";
import { trpc } from "@/lib/trpc";

export type VoiceCallState = "idle" | "recording" | "processing" | "speaking" | "completed" | "error";

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface CallData {
  jobType?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  description?: string;
  urgency?: number;
  photos?: string[];
  answers?: Record<string, any>;
}

export const [VoiceCallProvider, useVoiceCall] = createContextHook(() => {
  const [callState, setCallState] = useState<VoiceCallState>("idle");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [callData, setCallData] = useState<CallData>({});
  const [error, setError] = useState<string | null>(null);
  const [intakeId] = useState(`intake-${Date.now()}`);
  const [isInitialized, setIsInitialized] = useState(false);

  const processIntakeMutation = trpc.aiIntake.processMessage.useMutation();
  const summarizeMutation = trpc.aiIntake.summarize.useMutation();
  const createPhoneIntakeMutation = trpc.aiIntake.createPhoneIntake.useMutation();

  const initializeAudio = useCallback(async () => {
    if (isInitialized) return true;
    
    try {
      console.log("[VoiceCall] Initializing audio permissions");
      const { status } = await Audio.requestPermissionsAsync();
      
      if (status !== "granted") {
        setError("Microphone permission required");
        setCallState("error");
        return false;
      }

      if (Platform.OS !== "web") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });
      }

      setIsInitialized(true);
      console.log("[VoiceCall] Audio initialized successfully");
      return true;
    } catch (err) {
      console.error("[VoiceCall] Error initializing audio:", err);
      setError("Failed to initialize audio");
      setCallState("error");
      return false;
    }
  }, [isInitialized]);

  const startRecording = useCallback(async () => {
    try {
      console.log("[VoiceCall] Starting recording...");
      setCallState("recording");
      setError(null);

      const initialized = await initializeAudio();
      if (!initialized) return;

      const { recording: newRecording } = await Audio.Recording.createAsync({
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".wav",
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
        },
      });

      setRecording(newRecording);
      console.log("[VoiceCall] Recording started");
    } catch (err) {
      console.error("[VoiceCall] Failed to start recording:", err);
      setError("Failed to start recording");
      setCallState("error");
    }
  }, [initializeAudio]);

  const completeCall = useCallback(async () => {
    try {
      console.log("[VoiceCall] Completing call...");
      setCallState("processing");

      const summary = await summarizeMutation.mutateAsync({
        intakeId,
        collectedData: {
          jobType: callData.jobType || "",
          customerName: callData.customerName || "",
          phone: callData.phone || "",
          address: callData.address || "",
          description: callData.description || "",
          urgency: callData.urgency || 2,
          photos: callData.photos || [],
          answers: callData.answers || {},
        },
      });

      console.log("[VoiceCall] Creating phone intake lead...");
      
      const tradeTypeMap: Record<string, string> = {
        roofing: "roofing",
        landscaping: "landscaping",
        plumbing: "plumbing",
        electrical: "electrical",
        hvac: "hvac",
        siding: "siding",
        painting: "painting",
      };

      const tradeType = tradeTypeMap[callData.jobType?.toLowerCase() || ""] || "general_contractor";

      await createPhoneIntakeMutation.mutateAsync({
        trade_type: tradeType as any,
        contact: {
          full_name: callData.customerName || "Unknown",
          phone: callData.phone || "",
          email: "",
          preferred_contact: "phone",
        },
        property: {
          address: callData.address || "",
          city: "",
          state: "",
          zip: "",
          property_type: "residential",
          access_notes: "",
        },
        job_summary: summary.issueDescription,
        trade_specific_fields: {},
        photos_requested: false,
        appointment: {
          is_scheduled: false,
          date: "",
          time_window: "",
          visit_type: "",
        },
        notes_for_admin: summary.notesForAdmin,
        call_metadata: {
          call_id: intakeId,
          call_start: conversation[0]?.timestamp || new Date().toISOString(),
          call_end: new Date().toISOString(),
        },
      });

      const completionMessage: ConversationMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Thank you! I've created your service request. Someone from our team will contact you shortly.",
        timestamp: new Date().toISOString(),
      };

      setConversation((prev) => [...prev, completionMessage]);
      setCallState("completed");

      console.log("[VoiceCall] Call completed successfully");
    } catch (err) {
      console.error("[VoiceCall] Error completing call:", err);
      setError("Failed to complete call");
      setCallState("error");
    }
  }, [callData, conversation, intakeId, summarizeMutation, createPhoneIntakeMutation]);

  const stopRecording = useCallback(async () => {
    if (!recording) {
      console.log("[VoiceCall] No recording to stop");
      return;
    }

    try {
      console.log("[VoiceCall] Stopping recording...");
      setCallState("processing");
      
      await recording.stopAndUnloadAsync();
      
      if (Platform.OS !== "web") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      }

      const uri = recording.getURI();
      console.log("[VoiceCall] Recording stopped, URI:", uri);

      if (!uri) {
        throw new Error("No recording URI");
      }

      const formData = new FormData();
      
      if (Platform.OS === "web") {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append("audio", blob, "recording.webm");
      } else {
        const uriParts = uri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        
        const audioFile = {
          uri,
          name: `recording.${fileType}`,
          type: `audio/${fileType}`,
        } as any;
        
        formData.append("audio", audioFile);
      }

      console.log("[VoiceCall] Transcribing audio...");
      const transcribeResponse = await fetch(
        "https://toolkit.rork.com/stt/transcribe/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!transcribeResponse.ok) {
        throw new Error("Transcription failed");
      }

      const { text } = await transcribeResponse.json();
      console.log("[VoiceCall] Transcription:", text);

      const userMessage: ConversationMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      };

      setConversation((prev) => [...prev, userMessage]);

      console.log("[VoiceCall] Processing with AI...");
      const aiResponse = await processIntakeMutation.mutateAsync({
        intakeId,
        message: text,
        conversationHistory: conversation.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        currentData: callData,
      });

      const assistantMessage: ConversationMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: aiResponse.message,
        timestamp: new Date().toISOString(),
      };

      setConversation((prev) => [...prev, assistantMessage]);
      setCallData(aiResponse.extractedData as CallData);

      if (aiResponse.nextAction === "complete") {
        await completeCall();
      } else {
        setCallState("idle");
      }

      setRecording(null);
    } catch (err) {
      console.error("[VoiceCall] Error processing recording:", err);
      setError("Failed to process recording");
      setCallState("error");
      setRecording(null);
    }
  }, [recording, conversation, callData, intakeId, processIntakeMutation, completeCall]);

  const resetCall = useCallback(() => {
    setCallState("idle");
    setRecording(null);
    setConversation([]);
    setCallData({});
    setError(null);
    console.log("[VoiceCall] Call reset");
  }, []);

  const startCall = useCallback(async () => {
    console.log("[VoiceCall] Starting new call");
    resetCall();
    
    const welcomeMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: "Hello! I'm here to help schedule your service. What type of work do you need done?",
      timestamp: new Date().toISOString(),
    };
    
    setConversation([welcomeMessage]);
    setCallState("idle");
  }, [resetCall]);

  return {
    callState,
    recording,
    conversation,
    callData,
    error,
    startRecording,
    stopRecording,
    resetCall,
    startCall,
    isRecording: callState === "recording",
    isProcessing: callState === "processing",
    isCompleted: callState === "completed",
  };
});

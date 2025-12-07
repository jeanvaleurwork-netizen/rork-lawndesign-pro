import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { AIChatProvider } from "@/contexts/AIChatContext";
import { TradeProvider } from "@/contexts/TradeContext";
import { PagosAIProvider } from "@/contexts/PagosAIContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RootLayoutNav() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const hasNavigatedRef = React.useRef(false);

  useEffect(() => {
    if (!isLoading && !hasNavigatedRef.current) {
      if (!isAuthenticated) {
        hasNavigatedRef.current = true;
        router.replace("/welcome");
      }
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="role-selection" options={{ headerShown: false }} />
      <Stack.Screen name="admin-signup" options={{ headerShown: false }} />
      <Stack.Screen name="trade-selection" options={{ headerShown: false }} />
      <Stack.Screen name="subscription" options={{ headerShown: false }} />
      <Stack.Screen name="crew-login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="property-scan" options={{ headerShown: false }} />
      <Stack.Screen name="photo-analysis" options={{ headerShown: false }} />
      <Stack.Screen name="job-detail" options={{ headerShown: true }} />
      <Stack.Screen name="daily-schedule" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="customer-intake" options={{ headerShown: false }} />
      <Stack.Screen name="intake-summary" options={{ headerShown: true, title: "Intake Summary" }} />
      <Stack.Screen name="ai-intake-dashboard" options={{ headerShown: true, title: "AI Intake" }} />
      <Stack.Screen name="dispatch-assignment" options={{ headerShown: true, title: "Dispatch" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <OnboardingProvider>
            <TradeProvider>
              <DataProvider>
                <PagosAIProvider>
                  <AIChatProvider>
                    <LanguageProvider>
                      <GestureHandlerRootView style={{ flex: 1 }}>
                        <StatusBar style="dark" />
                        <RootLayoutNav />
                      </GestureHandlerRootView>
                    </LanguageProvider>
                  </AIChatProvider>
                </PagosAIProvider>
              </DataProvider>
            </TradeProvider>
          </OnboardingProvider>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

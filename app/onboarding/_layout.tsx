import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="select-trade" />
      <Stack.Screen name="what-we-do" />
      <Stack.Screen name="admin-or-crew" />
      <Stack.Screen name="company-setup" />
      <Stack.Screen name="team-setup" />
      <Stack.Screen name="job-tracking" />
      <Stack.Screen name="value-prop" />
      <Stack.Screen name="job-photos" />
      <Stack.Screen name="estimates-invoices" />
      <Stack.Screen name="profit-calculator" />
      <Stack.Screen name="crew-arrival" />
      <Stack.Screen name="property-analysis" />
      <Stack.Screen name="ai-office" />
      <Stack.Screen name="receipt-scanner" />
      <Stack.Screen name="contracts" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="subscription-overview" />
      <Stack.Screen name="trial-setup" />
    </Stack>
  );
}

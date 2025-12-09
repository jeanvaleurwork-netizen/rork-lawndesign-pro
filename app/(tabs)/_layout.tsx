import { Tabs } from "expo-router";
import { Home, FileText, Calendar, Users, Receipt, UsersRound, BarChart3, Wallet, FileCheck, Briefcase, Clock, Layers } from "lucide-react-native";
import React from "react";
import { Platform, ScrollView, View, StyleSheet, TouchableOpacity, Text } from "react-native";

import Colors from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function TabLayout() {
  const { t } = useLanguage();
  const { isAdmin, isCrew } = useAuth();
  const { canAccessTab } = useSubscription();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.light.card,
          borderTopColor: Colors.light.border,
          height: Platform.OS === "ios" ? 88 : 70,
          paddingTop: 8,
        },
      }}
      tabBar={(props) => (
        <View style={styles.tabBarContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
          >
            {props.state.routes.map((route, index) => {
              const isFocused = props.state.index === index;
              const options = props.descriptors[route.key].options;
              
              const hiddenRoutes = ['gallery', 'job-costing', 'daily-schedule'];
              if (hiddenRoutes.includes(route.name)) {
                return <React.Fragment key={route.key} />;
              }

              if (isCrew) {
                const crewOnlyRoutes = ['index', 'schedule', 'crew-jobs', 'crew-timecards'];
                if (!crewOnlyRoutes.includes(route.name)) {
                  return <React.Fragment key={route.key} />;
                }
              }

              if (isAdmin) {
                const adminHiddenRoutes = ['crew-jobs', 'crew-timecards'];
                if (adminHiddenRoutes.includes(route.name)) {
                  return <React.Fragment key={route.key} />;
                }
                
                if (!canAccessTab(route.name)) {
                  return <React.Fragment key={route.key} />;
                }
              }

              const onPress = () => {
                const event = props.navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  props.navigation.navigate(route.name);
                }
              };

              return (
                <TouchableOpacity 
                  key={route.key} 
                  style={[
                    styles.tabItem,
                    isFocused && styles.tabItemActive
                  ]} 
                  onPress={onPress}
                >
                  <View style={styles.tabIconContainer}>
                    {options.tabBarIcon?.({ 
                      color: isFocused ? Colors.light.primary : '#999',
                      size: 24,
                      focused: isFocused 
                    })}
                  </View>
                  {options.title ? (
                    <Text 
                      style={[
                        styles.tabLabel,
                        isFocused && styles.tabLabelActive
                      ]}
                      numberOfLines={1}
                    >
                      {String(options.title)}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="estimates"
        options={{
          title: t("tabs.estimates"),
          tabBarIcon: ({ color }) => <FileText color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: t("tabs.schedule"),
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: t("tabs.clients"),
          tabBarIcon: ({ color }) => <Users color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="job-costing"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="payroll"
        options={{
          title: t("tabs.payroll"),
          tabBarIcon: ({ color }) => <Wallet color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: t("tabs.analytics"),
          tabBarIcon: ({ color }) => <BarChart3 color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: t("tabs.invoices"),
          tabBarIcon: ({ color }) => <FileCheck color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="receipts"
        options={{
          title: t("tabs.receipts"),
          tabBarIcon: ({ color }) => <Receipt color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="crew"
        options={{
          title: t("tabs.crew"),
          tabBarIcon: ({ color }) => <UsersRound color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="crew-jobs"
        options={{
          title: t("tabs.jobs"),
          tabBarIcon: ({ color }) => <Briefcase color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="crew-timecards"
        options={{
          title: t("tabs.timecards"),
          tabBarIcon: ({ color }) => <Clock color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="daily-schedule"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="business"
        options={{
          title: t("tabs.business"),
          tabBarIcon: ({ color }) => <Layers color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: Colors.light.card,
    borderTopColor: Colors.light.border,
    borderTopWidth: 1,
    height: Platform.OS === "ios" ? 88 : 70,
    paddingBottom: Platform.OS === "ios" ? 28 : 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: Colors.light.cardLight,
  },
  tabIconContainer: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: Colors.light.primary,
    fontWeight: '600' as const,
  },
});

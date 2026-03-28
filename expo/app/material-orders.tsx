import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
} from "react-native";
import { router, Stack } from "expo-router";
import { ChevronLeft, Package, Plus, Clock, Truck, CheckCircle, DollarSign } from "lucide-react-native";
import Colors from "@/constants/colors";
import { MaterialOrder } from "@/types";

const statusColors = {
  draft: Colors.light.muted,
  ordered: Colors.light.primary,
  partial: Colors.light.warning,
  delivered: Colors.light.success,
  cancelled: Colors.light.error,
};

export default function MaterialOrdersScreen() {
  const [orders] = useState<MaterialOrder[]>([
    {
      id: "1",
      jobId: "5",
      orderNumber: "PO-2025-1142",
      supplier: "ABC Building Supply",
      orderDate: "2025-11-25",
      expectedDeliveryDate: "2025-12-02",
      items: [
        { id: "1", name: "Premium Sod", quantity: 2000, unit: "sqft", unitPrice: 0.45, totalPrice: 900 },
        { id: "2", name: "Topsoil", quantity: 10, unit: "yards", unitPrice: 35, totalPrice: 350 },
        { id: "3", name: "Fertilizer", quantity: 50, unit: "lbs", unitPrice: 2.5, totalPrice: 125 },
      ],
      subtotal: 1375,
      tax: 110,
      shipping: 65,
      total: 1550,
      status: "ordered",
      trackingNumber: "1Z999AA10123456784",
    },
    {
      id: "2",
      jobId: "2",
      orderNumber: "PO-2025-1089",
      supplier: "Green Thumb Nursery",
      orderDate: "2025-11-20",
      expectedDeliveryDate: "2025-11-27",
      actualDeliveryDate: "2025-11-27",
      items: [
        { id: "1", name: "Native Plants", quantity: 25, unit: "plants", unitPrice: 18, totalPrice: 450, received: 25 },
        { id: "2", name: "Mulch", quantity: 4, unit: "yards", unitPrice: 45, totalPrice: 180, received: 4 },
      ],
      subtotal: 630,
      tax: 50.40,
      shipping: 0,
      total: 680.40,
      status: "delivered",
      receivedBy: "Mike Chen",
    },
  ]);

  const activeOrders = orders.filter(o => o.status === "ordered" || o.status === "partial").length;
  const totalValue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingDelivery = orders.filter(o => {
    if (o.status !== "ordered") return false;
    const daysUntil = Math.ceil((new Date(o.expectedDeliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 3;
  }).length;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Material Orders",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft color={Colors.light.text} size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.primary + "20" }]}>
            <Package color={Colors.light.primary} size={20} />
          </View>
          <Text style={styles.statValue}>{activeOrders}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.warning + "20" }]}>
            <Truck color={Colors.light.warning} size={20} />
          </View>
          <Text style={styles.statValue}>{pendingDelivery}</Text>
          <Text style={styles.statLabel}>Arriving Soon</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.light.success + "20" }]}>
            <DollarSign color={Colors.light.success} size={20} />
          </View>
          <Text style={styles.statValue}>${(totalValue / 1000).toFixed(1)}k</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Orders</Text>
            <TouchableOpacity style={styles.addButton}>
              <Plus color="#FFF" size={20} />
            </TouchableOpacity>
          </View>

          {orders.map((order) => {
            const statusColor = statusColors[order.status];
            const daysUntilDelivery = Math.ceil(
              (new Date(order.expectedDeliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <View style={[styles.orderIcon, { backgroundColor: statusColor + "20" }]}>
                      <Package color={statusColor} size={24} />
                    </View>
                    <View>
                      <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                      <Text style={styles.supplier}>{order.supplier}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{order.status}</Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ordered:</Text>
                    <Text style={styles.detailValue}>{new Date(order.orderDate).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Expected:</Text>
                    <Text style={[
                      styles.detailValue,
                      daysUntilDelivery <= 3 && daysUntilDelivery >= 0 && { color: Colors.light.warning, fontWeight: "600" as const }
                    ]}>
                      {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                      {daysUntilDelivery >= 0 && daysUntilDelivery <= 3 && ` (${daysUntilDelivery}d)`}
                    </Text>
                  </View>
                  {order.actualDeliveryDate && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Delivered:</Text>
                      <Text style={[styles.detailValue, { color: Colors.light.success }]}>
                        {new Date(order.actualDeliveryDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {order.trackingNumber && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tracking:</Text>
                      <Text style={[styles.detailValue, { color: Colors.light.primary }]}>
                        {order.trackingNumber}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.itemsSection}>
                  <Text style={styles.itemsTitle}>{order.items.length} Item{order.items.length > 1 ? "s" : ""}</Text>
                  {order.items.map((item) => (
                    <View key={item.id} style={styles.item}>
                      <View style={styles.itemLeft}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemQty}>
                          {item.quantity} {item.unit} × ${item.unitPrice}
                        </Text>
                      </View>
                      <View style={styles.itemRight}>
                        <Text style={styles.itemTotal}>${item.totalPrice.toLocaleString()}</Text>
                        {item.received !== undefined && (
                          <View style={styles.receivedBadge}>
                            <CheckCircle color={Colors.light.success} size={12} />
                            <Text style={styles.receivedText}>Received</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.orderFooter}>
                  <View style={styles.costBreakdown}>
                    <View style={styles.costRow}>
                      <Text style={styles.costLabel}>Subtotal:</Text>
                      <Text style={styles.costValue}>${order.subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.costRow}>
                      <Text style={styles.costLabel}>Tax:</Text>
                      <Text style={styles.costValue}>${order.tax.toFixed(2)}</Text>
                    </View>
                    <View style={styles.costRow}>
                      <Text style={styles.costLabel}>Shipping:</Text>
                      <Text style={styles.costValue}>${order.shipping.toFixed(2)}</Text>
                    </View>
                  </View>
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.light.muted,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  orderCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  orderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  supplier: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "capitalize",
  },
  orderDetails: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  itemsSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  itemQty: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  itemRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  receivedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  receivedText: {
    fontSize: 10,
    color: Colors.light.success,
    fontWeight: "500" as const,
  },
  orderFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  costBreakdown: {
    gap: 4,
    marginBottom: 8,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  costLabel: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  costValue: {
    fontSize: 12,
    color: Colors.light.text,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
});

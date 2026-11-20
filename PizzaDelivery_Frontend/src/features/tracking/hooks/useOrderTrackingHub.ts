"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { toast } from "sonner";
import { createSignalRConnection } from "@/lib/signalr";
import { OrderStatusChangedPayload } from "../types";

export function useOrderTrackingHub(orderId: number | string | null) {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [liveStatus, setLiveStatus] = useState<OrderStatusChangedPayload | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const isJoinedRef = useRef(false);

  const startConnection = useCallback(async () => {
    if (!orderId) return;

    const hubConn = createSignalRConnection();

    hubConn.on("OrderStatusChanged", (payload: OrderStatusChangedPayload) => {
      if (payload.orderId === Number(orderId)) {
        setLiveStatus(payload);
        toast.info(`تحديث حالة الطلب: ${payload.statusText}`, {
          description: `نسبة الإنجاز: ${payload.progressPercentage}%`,
        });
      }
    });

    try {
      await hubConn.start();
      setIsConnected(true);
      if (!isJoinedRef.current) {
        await hubConn.invoke("JoinOrderGroup", Number(orderId));
        isJoinedRef.current = true;
      }
    } catch (err) {
      console.error("SignalR Connection Error:", err);
      setIsConnected(false);
    }

    setConnection(hubConn);
  }, [orderId]);

  useEffect(() => {
    startConnection();

    return () => {
      if (connection) {
        connection.stop();
      }
      isJoinedRef.current = false;
    };
  }, [orderId, startConnection]);

  return { isConnected, liveStatus };
}

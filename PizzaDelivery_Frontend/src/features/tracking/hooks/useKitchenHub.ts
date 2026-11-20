"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { createSignalRConnection } from "@/lib/signalr";
import { NewOrderNotificationPayload } from "../types";

export function useKitchenHub() {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [newOrders, setNewOrders] = useState<NewOrderNotificationPayload[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Audio Chime notification
    if (typeof window !== "undefined") {
      audioRef.current = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
      );
    }
  }, []);

  const playNotificationSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((e) => console.log("Audio autoplay restricted:", e));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const startConnection = useCallback(async () => {
    const hubConn = createSignalRConnection();

    hubConn.on("ReceiveNewOrder", (payload: NewOrderNotificationPayload) => {
      setNewOrders((prev) => [payload, ...prev]);
      playNotificationSound();
      toast.success(`طلب جديد وارد #${payload.orderId}!`, {
        description: `العميل: ${payload.customerName} - المبلغ: ${payload.totalAmount} ج.م`,
        duration: 10000,
      });

      // Invalidate admin queries for fresh data
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    });

    try {
      await hubConn.start();
      setIsConnected(true);
      await hubConn.invoke("JoinAdminGroup");
    } catch (err) {
      console.error("SignalR Admin Group Error:", err);
      setIsConnected(false);
    }

    setConnection(hubConn);
  }, [queryClient]);

  useEffect(() => {
    startConnection();

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [startConnection]);

  return { isConnected, newOrders };
}

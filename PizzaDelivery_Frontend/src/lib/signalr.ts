import * as signalR from "@microsoft/signalr";

const SIGNALR_HUB_URL =
  process.env.NEXT_PUBLIC_SIGNALR_HUB_URL || "http://localhost:5051/hubs/order";

export function createSignalRConnection(customUrl?: string): signalR.HubConnection {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const url = customUrl || SIGNALR_HUB_URL;

  return new signalR.HubConnectionBuilder()
    .withUrl(`${url}?access_token=${token || ""}`, {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Information)
    .build();
}

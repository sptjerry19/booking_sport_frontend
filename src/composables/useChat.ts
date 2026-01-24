import { ref, onUnmounted } from "vue";
import { useApi } from "./useApi";

export const useChat = (chatRoomId: number | string) => {
  const api = useApi();
  const messages = ref<any[]>([]);
  const loading = ref(false);
  const sending = ref(false);
  const error = ref<string | null>(null);
  let pollingInterval: any = null;

  const loadMessages = async (isPoll = false) => {
    if (!chatRoomId) return;
    
    if (!isPoll) loading.value = true;
    
    try {
      const lastId = messages.value.length > 0 ? messages.value[messages.value.length - 1].id : 0;
      // If polling, we only want new messages. 
      // But if we want to sync status updates of previous messages (unlikely for now), we might fetch all?
      // Spec says: GET /api/chat-rooms/{id}/messages?last_id=123
      
      const response = await api.getChatMessages(chatRoomId, { last_id: lastId });
      
      if (response.data.data && response.data.data.length > 0) {
        messages.value = [...messages.value, ...response.data.data];
        // Scroll to bottom logic should be handled in component watcher
      }
    } catch (err: any) {
      console.error("Failed to load messages:", err);
      // Don't show error on polling failure to avoid UI flicker
      if (!isPoll) error.value = "Không thể tải tin nhắn.";
    } finally {
      if (!isPoll) loading.value = false;
    }
  };

  const sendMessage = async (type: "TEXT" | "FILE", content: any) => {
    if (!chatRoomId) return;
    
    sending.value = true;
    try {
      const response = await api.sendChatMessage(chatRoomId, {
        type,
        content
      });
      
      // Add message immediately or wait for poll? 
      // Better to add immediately for responsiveness.
      // But polling might duplicate if we blindly add.
      // API returns the created message.
      messages.value.push(response.data.data);
      
      return { success: true };
    } catch (err: any) {
      console.error("Failed to send message:", err);
      return { success: false, error: err.response?.data?.message || "Gửi tin nhắn thất bại" };
    } finally {
      sending.value = false;
    }
  };

  const confirmBooking = async () => {
     if (!chatRoomId) return;
     
     try {
         await api.confirmBookingViaChat(chatRoomId);
         // Rely on polling to get the SYSTEM message and updated status (if we refetch booking)
         return { success: true };
     } catch (err: any) {
         return { success: false, error: err.response?.data?.message || "Xác nhận thất bại" };
     }
  };

  const startPolling = (interval = 3000) => {
    loadMessages(); // Initial load
    pollingInterval = setInterval(() => {
      loadMessages(true);
    }, interval);
  };

  const stopPolling = () => {
    if (pollingInterval) clearInterval(pollingInterval);
  };

  onUnmounted(() => {
    stopPolling();
  });

  return {
    messages,
    loading,
    sending,
    error,
    loadMessages,
    sendMessage,
    confirmBooking,
    startPolling,
    stopPolling
  };
};

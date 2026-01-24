<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden flex flex-col h-[80vh]">
      <!-- Loading State -->
      <div v-if="loadingRoom" class="flex-1 flex items-center justify-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div class="bg-red-100 p-3 rounded-full mb-4">
           <svg class="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
           </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Không thể truy cập</h3>
        <p class="text-gray-500">{{ error }}</p>
      </div>

      <!-- Chat Interface -->
      <template v-else>
        <!-- Header -->
        <div class="bg-blue-600 p-4 text-white">
          <h1 class="text-lg font-bold">{{ roomInfo.venue_name }}</h1>
          <p class="text-sm opacity-90">{{ roomInfo.court_name }}</p>
        </div>

        <!-- Messages -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
             <div v-if="messages.length === 0" class="text-center text-gray-400 py-8 text-sm">
                Bắt đầu trò chuyện...
             </div>
             
             <div 
                v-for="msg in messages" 
                :key="msg.id" 
                class="flex flex-col space-y-1"
                :class="{
                  'items-end': isMyMessage(msg),
                  'items-start': !isMyMessage(msg),
                  'items-center': msg.sender_role === 'SYSTEM'
                }"
              >
                <!-- System Message -->
                <span v-if="msg.sender_role === 'SYSTEM'" class="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                    {{ parseContent(msg).text || parseContent(msg) }}
                </span>

                <!-- Normal Message -->
                <div v-else class="max-w-[85%]">
                     <p v-if="!isMyMessage(msg)" class="text-[10px] text-gray-500 ml-1 mb-0.5">
                        {{ getSenderName(msg) }}
                     </p>
                     
                     <div 
                        class="px-4 py-2 text-sm shadow-sm rounded-2xl"
                        :class="{
                             'bg-blue-600 text-white': isMyMessage(msg),
                             'bg-white text-gray-800 border': !isMyMessage(msg)
                        }"
                     >
                        <div v-if="msg.type === 'ACTION'" class="font-bold">
                           {{ formatAction(msg) }}
                        </div>
                        <div v-else>
                           {{ parseContent(msg).text || parseContent(msg) }}
                        </div>
                     </div>
                </div>
             </div>
        </div>
        
        <!-- Name Input (if not set) -->
        <div v-if="!guestName" class="p-4 bg-white border-t border-gray-200">
             <label class="block text-sm font-medium text-gray-700 mb-2">Nhập tên của bạn để chat:</label>
             <form @submit.prevent="setGuestName" class="flex gap-2">
                 <input 
                    v-model="nameInput" 
                    type="text" 
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Tên của bạn..."
                    required
                 />
                 <button 
                    type="submit" 
                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    :disabled="!nameInput.trim()"
                 >
                    Bắt đầu
                 </button>
             </form>
        </div>

        <!-- Message Input -->
        <div v-else class="p-4 bg-white border-t border-gray-200">
             <form @submit.prevent="sendMessage" class="flex gap-2">
                 <input 
                    v-model="newMessage" 
                    type="text" 
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Nhập tin nhắn..."
                    :disabled="sending"
                 />
                 <button 
                    type="submit" 
                    class="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50"
                    :disabled="!newMessage.trim() || sending"
                 >
                   <svg class="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                     <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                   </svg>
                 </button>
             </form>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { useApi } from "@/composables/useApi";

export default {
  name: "PublicChatRoom",
  setup() {
    const route = useRoute();
    const api = useApi();
    
    const uuid = route.params.token;
    const roomInfo = ref(null);
    const messages = ref([]);
    const loadingRoom = ref(true);
    const error = ref(null);
    const guestName = ref(localStorage.getItem(`chat_guest_name_${uuid}`) || "");
    const nameInput = ref("");
    const newMessage = ref("");
    const sending = ref(false);
    const messagesContainer = ref(null);
    
    let pollingInterval = null;

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    };

    const loadRoomInfo = async () => {
        try {
            loadingRoom.value = true;
            const res = await api.checkPublicChat(uuid);
            roomInfo.value = res.data.data;
            startPolling();
        } catch (err) {
            error.value = "Phòng chat không tồn tại hoặc đã hết hạn.";
        } finally {
            loadingRoom.value = false;
        }
    };

    const loadMessages = async () => {
        if (!uuid) return;
        try {
            const lastId = messages.value.length > 0 ? messages.value[messages.value.length - 1].id : 0;
            const res = await api.getPublicChatMessages(uuid, { last_id: lastId });
            if (res.data.data && res.data.data.length > 0) {
                 messages.value = [...messages.value, ...res.data.data];
            }
        } catch (err) {
            console.error("Polling error", err);
        }
    };

    const startPolling = () => {
        loadMessages();
        pollingInterval = setInterval(loadMessages, 3000);
    };

    const setGuestName = () => {
        if (nameInput.value.trim()) {
            guestName.value = nameInput.value.trim();
            localStorage.setItem(`chat_guest_name_${uuid}`, guestName.value);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.value.trim() || !guestName.value) return;
        
        sending.value = true;
        try {
             const res = await api.sendPublicChatMessage(uuid, {
                 type: "TEXT",
                 content: newMessage.value,
                 sender_name: guestName.value
             });
             messages.value.push(res.data.data);
             newMessage.value = "";
             scrollToBottom();
        } catch (err) {
            alert("Gửi tin nhắn thất bại");
        } finally {
            sending.value = false;
        }
    };

    // Helper functions
    const isMyMessage = (msg) => {
        // If guest, match by sender_name and role GUEST
        if (msg.sender_role === 'GUEST' && msg.sender_name === guestName.value) return true;
        return false;
    };
    
    const parseContent = (msg) => {
        if (typeof msg.content === 'string') {
             try {
                 return JSON.parse(msg.content);
             } catch (e) {
                 return { text: msg.content };
             }
        }
        return msg.content;
    };

    const formatAction = (msg) => {
        const content = parseContent(msg);
        if (content.action === 'CONFIRM') return 'Đã xác nhận đặt sân';
        if (content.action === 'REJECT') return 'Đã từ chối đặt sân';
        return 'Hành động cập nhật';
    };

    const getSenderName = (msg) => {
        if (msg.sender && msg.sender.name) return msg.sender.name;
        if (msg.sender_name) return msg.sender_name;
        if (msg.sender_role === 'OWNER') return 'Chủ sân';
        if (msg.sender_role === 'USER') return 'Khách hàng';
        return 'Guest';
    };
    
    watch(messages, (newVal, oldVal) => {
        if (newVal.length > oldVal.length) {
            scrollToBottom();
        }
    }, { deep: true });

    onMounted(() => {
        loadRoomInfo();
    });

    onUnmounted(() => {
        if (pollingInterval) clearInterval(pollingInterval);
    });

    return {
        roomInfo,
        messages,
        loadingRoom,
        error,
        guestName,
        nameInput,
        newMessage,
        sending,
        messagesContainer,
        setGuestName,
        sendMessage,
        isMyMessage,
        parseContent,
        formatAction,
        getSenderName
    };
  }
};
</script>

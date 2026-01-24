<template>
  <div class="bg-white rounded-lg shadow flex flex-col h-[600px]">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
      <div>
        <h3 class="font-semibold text-gray-800">Trao đổi với chủ sân</h3>
        <p class="text-xs text-gray-500">Booking #{{ bookingId }}</p>
      </div>
      <div>
         <button 
           @click="copyJoinLink" 
           class="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
           title="Sao chép link mời người khác"
         >
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
           </svg>
           <span v-if="copied">Đã chép!</span>
           <span v-else>Mời khách</span>
         </button>
      </div>
    </div>

    <!-- Messages Area -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      <div v-if="loading && messages.length === 0" class="flex justify-center pt-4">
         <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
      
      <div v-if="messages.length === 0 && !loading" class="text-center text-gray-500 py-8">
        Chưa có tin nhắn nào.
      </div>

      <div 
        v-for="msg in messages" 
        :key="msg.id" 
        class="flex flex-col space-y-1"
        :class="{
          'items-end': isResultFromMe(msg),
          'items-start': !isResultFromMe(msg),
          'items-center': msg.sender_role === 'SYSTEM'
        }"
      >
        <!-- System Message -->
        <span v-if="msg.sender_role === 'SYSTEM'" class="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
            {{ parseContent(msg).text || parseContent(msg) }}
        </span>

        <!-- User/Owner Message -->
        <div 
          v-else 
          class="max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm"
          :class="{
            'bg-blue-600 text-white': isResultFromMe(msg),
            'bg-white text-gray-800 border': !isResultFromMe(msg)
          }"
        >
          <div v-if="!isResultFromMe(msg)" class="text-[10px] opacity-75 mb-1 font-medium">
             {{ getSenderName(msg) }}
          </div>

          <!-- ACTION Type -->
          <div v-if="msg.type === 'ACTION'" class="font-bold">
              {{ formatAction(msg) }}
          </div>

          <!-- TEXT Type -->
          <div v-else>
             {{ parseContent(msg).text || parseContent(msg) }}
          </div>
          
          <div 
            class="text-[10px] mt-1 text-right"
            :class="isResultFromMe(msg) ? 'text-blue-200' : 'text-gray-400'"
          >
            {{ formatTime(msg.created_at) }}
          </div>
        </div>
      </div>
    </div>

    <!-- owner actions for pending booking -->
    <div v-if="isOwner && bookingStatus === 'pending'" class="p-3 bg-yellow-50 border-t border-yellow-100">
        <div class="flex items-center justify-between">
            <span class="text-sm text-yellow-800 font-medium">Đơn đặt sân đang chờ xác nhận</span>
            <div class="space-x-2">
                <button 
                  @click="handleConfirmBooking"
                  class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  Xác nhận
                </button>
                 <!-- Reject and Request Change can be added here -->
            </div>
        </div>
    </div>

    <!-- Input Area -->
    <div class="p-4 border-t border-gray-200 bg-white rounded-b-lg">
      <form @submit.prevent="handleSendMessage" class="flex gap-2">
        <input 
          v-model="newMessage" 
          type="text" 
          placeholder="Nhập tin nhắn..." 
          class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="sending"
        />
        <button 
          type="submit" 
          class="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
          :disabled="!newMessage.trim() || sending"
        >
          <svg class="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick, onMounted } from "vue";
import { useChat } from "@/composables/useChat";

export default {
  name: "ChatWindow",
  props: {
    bookingId: {
      type: Number,
      required: true
    },
    chatRoomId: {
      type: Number,
      required: true
    },
    chatRoomUuid: {
      type: String, 
      default: ''
    },
    currentUser: {
       type: Object,
       required: true
    },
    isOwner: {
        type: Boolean,
        default: false
    },
    bookingStatus: {
        type: String, 
        default: ''
    }
  },
  emits: ['status-changed'],
  setup(props, { emit }) {
    const { 
        messages, 
        loading, 
        sending, 
        loadMessages, 
        sendMessage, 
        confirmBooking,
        startPolling,
        stopPolling
    } = useChat(props.chatRoomId);

    const newMessage = ref("");
    const messagesContainer = ref(null);
    const copied = ref(false);

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    };
    
    const copyJoinLink = () => {
        if (!props.chatRoomUuid) {
            alert("Không tìm thấy link chia sẻ");
            return;
        }
        const link = `${window.location.origin}/chat/join/${props.chatRoomUuid}`;
        navigator.clipboard.writeText(link).then(() => {
            copied.value = true;
            setTimeout(() => copied.value = false, 2000);
        });
    };

    onMounted(() => {
        startPolling(3000);
    });

    watch(messages, (newVal, oldVal) => {
        if (newVal.length > oldVal.length) {
            scrollToBottom();
        }
    }, { deep: true });

    const handleSendMessage = async () => {
        if (!newMessage.value.trim()) return;
        
        const content = { text: newMessage.value };
        const result = await sendMessage("TEXT", content);
        
        if (result.success) {
            newMessage.value = "";
            scrollToBottom();
        } else {
            alert(result.error);
        }
    };

    const handleConfirmBooking = async () => {
        if (!confirm("Bạn có chắc chắn muốn xác nhận đặt sân này?")) return;

        const result = await confirmBooking();
        if (result.success) {
             emit('status-changed');
        } else {
            alert(result.error);
        }
    };
    
    // Helper functionality
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
    
    const isResultFromMe = (msg) => {
        // If msg.sender_id matches current user
        if (msg.sender_id === props.currentUser.id) return true;
        // Or if I am owner and msg role is OWNER
        if (props.isOwner && msg.sender_role === 'OWNER') return true;
        // Or if I am user and msg role is USER
        if (!props.isOwner && msg.sender_role === 'USER') return true;
        
        return false;
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

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return {
        messages,
        loading,
        sending,
        newMessage,
        messagesContainer,
        copied,
        handleSendMessage,
        handleConfirmBooking,
        copyJoinLink,
        parseContent,
        isResultFromMe,
        formatAction,
        formatTime,
        getSenderName
    };
  }
};
</script>

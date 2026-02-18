<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    <TransitionGroup
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        :show="true"
        :type="toast.type"
        :title="toast.title"
        :message="toast.message"
        :duration="0"
        :persistent="true"
        @close="removeToast(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script>
import { useToast } from "@/composables/useToast";
import Toast from "./Toast.vue";

export default {
  name: "ToastContainer",
  components: {
    Toast,
  },
  setup() {
    const { toasts, removeToast } = useToast();

    return {
      toasts,
      removeToast,
    };
  },
};
</script>

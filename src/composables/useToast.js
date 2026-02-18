import { ref } from "vue";

const toasts = ref([]);

export function useToast() {
  const addToast = ({ title, message, type = "info", duration = 5000 }) => {
    const id = Date.now();
    const toast = {
      id,
      title,
      message,
      type,
      duration,
    };
    toasts.value.push(toast);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  return {
    toasts,
    addToast,
    removeToast,
  };
}

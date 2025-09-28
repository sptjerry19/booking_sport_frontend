import { ref, computed, watch, onMounted } from "vue";

const isDarkMode = ref(false);

export function useDarkMode() {
  // Khởi tạo dark mode từ localStorage hoặc system preference
  const initializeDarkMode = () => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme !== null) {
      isDarkMode.value = savedTheme === "true";
    } else {
      // Nếu chưa có setting, sử dụng system preference
      isDarkMode.value = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
    }
    applyDarkMode();
  };

  // Áp dụng dark mode vào DOM
  const applyDarkMode = () => {
    const body = document.body;
    if (isDarkMode.value) {
      body.classList.add("dark-mode");
      document.documentElement.classList.add("dark");
    } else {
      body.classList.remove("dark-mode");
      document.documentElement.classList.remove("dark");
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem("darkMode", isDarkMode.value.toString());
    applyDarkMode();
  };

  // Set dark mode
  const setDarkMode = (value: boolean) => {
    isDarkMode.value = value;
    localStorage.setItem("darkMode", value.toString());
    applyDarkMode();
  };

  // Computed properties
  const isDark = computed(() => isDarkMode.value);
  const isLight = computed(() => !isDarkMode.value);

  // Watch for system theme changes
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    if (localStorage.getItem("darkMode") === null) {
      isDarkMode.value = e.matches;
      applyDarkMode();
    }
  };

  // Khởi tạo ngay lập tức
  initializeDarkMode();

  onMounted(() => {
    mediaQuery.addEventListener("change", handleSystemThemeChange);
  });

  return {
    isDark,
    isLight,
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
    applyDarkMode,
    initializeDarkMode,
  };
}

<script setup>
import { RouterView } from "vue-router";
import { onMounted } from "vue";
import Navbar from "./components/Layout/Navbar.vue";
import NotificationPermission from "./components/UI/NotificationPermission.vue";
import { useDarkMode } from "./composables/useDarkMode";

// Khởi tạo dark mode
const { initializeDarkMode } = useDarkMode();

onMounted(() => {
  initializeDarkMode();
});
</script>

<template>
  <div id="app">
    <Navbar />
    <main>
      <div class="mt-16"></div>
      <RouterView />
    </main>
    <!-- Notification Permission Modal -->
    <NotificationPermission />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>

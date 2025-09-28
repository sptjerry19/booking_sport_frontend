<template>
  <div class="dark-mode-toggle">
    <input
      type="checkbox"
      :checked="isDark"
      @change="toggleDarkMode"
      class="switch"
    />
  </div>
</template>

<script setup>
import { useDarkMode } from '@/composables/useDarkMode'

const { isDark, toggleDarkMode } = useDarkMode()
</script>

<style scoped>
.dark-mode-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
}

.switch {
  position: relative;
  width: 130px;
  height: 50px;
  margin: 0px;
  appearance: none;
  -webkit-appearance: none;
}

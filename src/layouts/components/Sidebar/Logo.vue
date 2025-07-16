<template>
  <img
    class="logo-img"
    src="@/assets/logo.png"
    :width="size"
    :height="size"
    alt="Logo"
  />
</template>

<script setup lang="ts">
defineProps({
  size: {
    type: [Number, String],
    default: 32
  },
})
</script>

<style scoped>
.logo-img {
  transition: transform 0.3s ease;
}

.logo-img:hover {
  transform: scale(1.1);
}
</style> 
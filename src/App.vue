<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

onMounted(() => {
  // 初始化应用
  appStore.initApp()
})
</script>

<style>
#app {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
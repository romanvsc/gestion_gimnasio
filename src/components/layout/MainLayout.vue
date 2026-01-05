<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <!-- Sidebar para desktop -->
    <Sidebar />

    <!-- Contenido principal -->
    <div class="flex flex-col w-0 flex-1 overflow-hidden">
      <!-- Main content -->
      <main class="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
        <router-view />
      </main>

      <!-- Bottom navigation para mobile -->
      <BottomNav />
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
import BottomNav from './BottomNav.vue'
</script>
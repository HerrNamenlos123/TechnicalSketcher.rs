<script setup lang="ts">
import Sketcher from './components/Sketcher/Sketcher.vue';
import TopBar from './components/TopBar.vue';
</script>

<template>
  <div class="flex flex-col bg-background h-screen w-screen text-text">
    <TopBar />
    <div class="relative w-full flex-grow flex">
      <Sketcher :invert-mouse="false" :snap-to-grid-c-m="1" :zoom-sensitivity="0.001" />
    </div>
  </div>
</template>

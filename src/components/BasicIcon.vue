<script setup lang="ts">
import * as icons from '@phosphor-icons/vue';

const props = defineProps<{
  icon: string;
}>();

const IconComponent = icons[props.icon] || icons.PhQuestion; // Fallback to a default icon if not found
</script>

<template>
  <component :is="IconComponent" />
</template>

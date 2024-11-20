<script setup lang="ts">
import { onUpdated } from "vue";
import { CircleShape, PathShape, type Shape } from "../types/Shapes";

const props = defineProps<{
  shapes: Shape[];
}>();

onUpdated(() => {
  console.log("Shapes updated");
  console.log(props.shapes);
});
</script>

<template>
  <template v-for="shape in shapes" :key="shape">
    <path v-if="shape instanceof PathShape" :d="shape.getPathData()" />
    <circle
      v-else-if="shape instanceof CircleShape"
      :cx="shape.center.x"
      :cy="shape.center.y"
      :r="shape.radius"
      fill="red"
    />
  </template>
</template>

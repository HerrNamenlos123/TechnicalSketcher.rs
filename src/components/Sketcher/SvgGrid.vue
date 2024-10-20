<script setup lang="ts">
import { computed } from "vue";
import type { Vec2 } from "../types/Vector";
import { TskDocument } from "../types/TskDocument";

const props = defineProps<{
  document: TskDocument;
}>();

const gridWidth = 0.1;
const gridSpacing = 10;
// const pixelCorrection = 0.5;

// function drawCanvasLine(from: Vec2, to: Vec2) {
//   ctx.beginPath();
//   ctx.moveTo(from.x, from.y);
//   ctx.lineTo(to.x, to.y);
//   ctx.lineWidth = gridWidth;
//   ctx.stroke();
// }

const verticalLinesX = computed(() => {
  const lines = [] as number[];
  const gridSize = props.document.objectToCanvasDistance(gridSpacing);
  for (
    let x = props.document.pan.x + gridSize;
    x < props.document.svgSize().x;
    x += gridSize
  ) {
    lines.push(x);
  }
  for (let x = props.document.pan.x; x > 0; x -= gridSize) {
    lines.push(x);
  }
  return lines;
});

const horizontalLinesY = computed(() => {
  const lines = [] as number[];
  const gridSize = props.document.objectToCanvasDistance(gridSpacing);
  for (
    let y = props.document.pan.y + gridSize;
    y < props.document.svgSize().y;
    y += gridSize
  ) {
    lines.push(y);
  }
  for (let y = props.document.pan.y; y > 0; y -= gridSize) {
    lines.push(y);
  }
  return lines;
});
</script>

<template>
  <line
    v-for="x in verticalLinesX"
    :x1="x"
    :y1="0"
    :x2="x"
    :y2="document.svgSize().y"
    stroke="black"
    :stroke-width="gridWidth"
  />
  <line
    v-for="y in horizontalLinesY"
    :x1="0"
    :y1="y"
    :x2="document.svgSize().x"
    :y2="y"
    stroke="black"
    :stroke-width="gridWidth"
  />
</template>

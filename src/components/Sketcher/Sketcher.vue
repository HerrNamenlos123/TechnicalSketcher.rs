<script setup lang="ts">
import { Vec2 } from "../types/Vector";
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { TskDocument } from "../types/TskDocument";
import Toolbar from "./Toolbar.vue";
import { useResizeObserver } from "@vueuse/core";
import { PenTool, SelectTool } from "../types/Tools";
import SvgGrid from "./SvgGrid.vue";
import { CircleShape, PathShape } from "../types/Shapes";

const props = withDefaults(
  defineProps<{
    zoomSensitivity: number;
    invertMouse: boolean;
    snapToGridCM: number;
    minZoomFactor?: number;
    maxZoomFactor?: number;
  }>(),
  {
    minZoomFactor: 0.1,
    maxZoomFactor: 100,
  },
);

/// =================================================================
/// ====                         Canvas                          ====
/// =================================================================
const canvasWrapper = ref<HTMLDivElement | null>(null);
const svgRef = ref<SVGSVGElement | null>(null);

const document = ref(new TskDocument());
onMounted(async () => {
  await nextTick();
  document.value.svgRef = svgRef.value;
});

/// =================================================================
/// ====                     Mouse Position                      ====
/// =================================================================
const onMouseMove = (e: MouseEvent) => {
  document.value.globalMousePosition.x = e.clientX;
  document.value.globalMousePosition.y = e.clientY;
  document.value.onCursorMove(0);
};

/// =================================================================
/// ====                     Tool Selection                      ====
/// =================================================================
const selectedToolId = ref("pen");
watch(
  selectedToolId,
  () => {
    document.value.selectTool(selectedToolId.value);
  },
  { immediate: true, deep: true },
);

const previewPathData = computed(() => {
  if (document.value.selectedTool instanceof PenTool) {
    return document.value.selectedTool.getPathData();
  }
});

const handleKeyDown = (e: KeyboardEvent) => {
  document.value.handleKey(e.code);
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
    document.value.shiftPressed = true;
  }
  document.value.onCursorMove(0);
};

const handleKeyUp = (e: KeyboardEvent) => {
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
    document.value.shiftPressed = false;
  }
  document.value.onCursorMove(0);
};

const handlePanDelta = (delta: Vec2) => {
  document.value.pan = document.value.pan.add(delta);
};

const handleZoom = (newGlobalFactor: number, averagePosition: Vec2) => {
  const averageInCanvasCoords =
    document.value.globalCoordsToCanvasCoords(averagePosition);
  const averageToPrevPan = document.value.pan.sub(averageInCanvasCoords);

  if (newGlobalFactor > props.maxZoomFactor) {
    newGlobalFactor = props.maxZoomFactor;
  }
  if (newGlobalFactor < props.minZoomFactor) {
    newGlobalFactor = props.minZoomFactor;
  }

  const scaledAverageToPan = averageToPrevPan.mul(
    newGlobalFactor / document.value.zoom,
  );

  document.value.pan = averageInCanvasCoords.add(scaledAverageToPan);
  document.value.zoom = newGlobalFactor;
};

const handleWheel = (e: WheelEvent) => {
  if (e.ctrlKey) {
    const delta = e.deltaX + e.deltaY;
    const newGlobalZoom =
      document.value.zoom +
      document.value.zoom * (-delta * props.zoomSensitivity);
    handleZoom(newGlobalZoom, new Vec2(e.clientX, e.clientY));
  } else {
    const delta = new Vec2(-e.deltaX, -e.deltaY);
    if (props.invertMouse) {
      delta.mul(-1);
    }
    handlePanDelta(delta);
  }
};

const moveCanvasCenterTo = (point: Vec2) => {
  document.value.pan = point;
};

const updatePointers = () => {
  const nav = document.value.nav;
  const numberOfFingers = nav.eventCache.length;
  if (numberOfFingers === 1) {
    const averagePosition = new Vec2(
      nav.eventCache[0].clientX,
      nav.eventCache[0].clientY,
    );
    if (!nav.lastAveragePosition) {
      nav.lastAveragePosition = averagePosition;
      return;
    }
    handlePanDelta(averagePosition.sub(nav.lastAveragePosition));
    nav.lastAveragePosition = averagePosition;
    return;
  } else if (numberOfFingers !== 2) {
    nav.initialZoomFingerDistance = undefined;
    nav.lastAveragePosition = undefined;
    nav.initialZoomFactor = undefined;
    return;
  }

  const finger1 = new Vec2(
    nav.eventCache[0].clientX,
    nav.eventCache[0].clientY,
  );
  const finger2 = new Vec2(
    nav.eventCache[1].clientX,
    nav.eventCache[1].clientY,
  );
  const averagePosition = finger1.add(finger2).div(2);
  const fingerDistance = finger2.sub(finger1).mag();

  if (
    !nav.initialZoomFingerDistance ||
    !nav.lastAveragePosition ||
    !nav.initialZoomFactor ||
    !nav.initialZoomPosition
  ) {
    nav.initialZoomFingerDistance = fingerDistance;
    nav.lastAveragePosition = averagePosition;
    nav.initialZoomFactor = document.value.zoom;
    nav.initialZoomPosition = averagePosition;
    return;
  }

  handlePanDelta(averagePosition.sub(nav.lastAveragePosition));
  const fingerDistanceScaleFactor =
    fingerDistance / nav.initialZoomFingerDistance;
  handleZoom(
    nav.initialZoomFactor * fingerDistanceScaleFactor,
    averagePosition,
  );

  nav.lastAveragePosition = averagePosition;
};

const pointerDownHandler = (e: PointerEvent) => {
  const nav = document.value.nav;
  document.value.shiftPressed = e.shiftKey;
  if (e.pointerType == "touch") {
    nav.eventCache.push(e);
    nav.initialZoomFingerDistance = undefined;
    nav.lastAveragePosition = undefined;
    nav.initialZoomFactor = undefined;
    updatePointers();
    document.value.cursorPreviewEnabled = false;
  } else if (e.pointerType == "mouse") {
    const mousePos = new Vec2(e.clientX, e.clientY);
    if (e.buttons === 4 || (e.shiftKey && e.buttons == 1)) {
      nav.prevMousePosition = mousePos;
    }
    switch (e.button) {
      case 0:
        document.value.onCursorDown("left", e.pressure);
        break;
      case 1:
        document.value.onCursorDown("wheel", e.pressure);
        break;
      case 2:
        document.value.onCursorDown("right", e.pressure);
        break;
    }
    document.value.cursorPreviewEnabled = false;
  } else if (e.pointerType == "pen") {
    document.value.onCursorDown("left", e.pressure);
    document.value.cursorPreviewEnabled = false;
    document.value.mouseCursorHidden = true;
  }
};

const pointerMoveHandler = (e: PointerEvent) => {
  const nav = document.value.nav;
  document.value.shiftPressed = e.shiftKey;
  if (e.pointerType == "touch") {
    const index = nav.eventCache.findIndex(
      (cachedEv) => cachedEv.pointerId === e.pointerId,
    );
    nav.eventCache[index] = e;
    updatePointers();
    document.value.cursorPreviewEnabled = false;
  } else if (e.pointerType == "mouse") {
    const mouse = new Vec2(e.clientX, e.clientY);
    if (
      e.buttons === 4 ||
      (e.shiftKey &&
        e.buttons == 1 &&
        document.value.selectedTool instanceof SelectTool)
    ) {
      handlePanDelta(mouse.sub(nav.prevMousePosition));
    }
    nav.prevMousePosition = mouse;
    document.value.cursorPreviewEnabled = false;
  } else if (e.pointerType == "pen") {
    const pen = new Vec2(e.clientX, e.clientY);
    nav.prevMousePosition = pen;
    onMouseMove(e);
    document.value.onCursorMove(e.pressure);
  }
};

const pointerUpHandler = (e: PointerEvent, type: "up" | "leave") => {
  const nav = document.value.nav;
  if (e.pointerType == "touch") {
    const index = nav.eventCache.findIndex(
      (cachedEv) => cachedEv.pointerId === e.pointerId,
    );
    if (index !== -1) {
      nav.eventCache.splice(index, 1);
    }
    nav.initialZoomFingerDistance = undefined;
    nav.lastAveragePosition = undefined;
    nav.initialZoomFactor = undefined;
    updatePointers();
  } else if (e.pointerType == "mouse") {
    document.value.shiftPressed = e.shiftKey;
    switch (e.button) {
      case 0:
        document.value.onCursorUp("left");
        break;
      case 1:
        document.value.onCursorUp("wheel");
        break;
      case 2:
        document.value.onCursorUp("right");
        break;
    }
  } else if (e.pointerType == "pen") {
    document.value.shiftPressed = e.shiftKey;
    document.value.onCursorUp("left");
    document.value.cursorPreviewEnabled = true;
    document.value.mouseCursorHidden = false;
  }
};

//     const drawCircle = (
//         position: Vec2,
//         radius: number,
//         lineWidth: number,
//         strokeStyle: string
// ) => {
//         const c = this.ctx;
//         const p = this.objectToCanvasCoords(position);
//         const r = this.objectToCanvasDistance(radius);
//
//         // Optimize bounding box
//
//         c.beginPath();
//         c.arc(p.x, p.y, r, 0, Math.PI * 2);
//         c.lineWidth = this.objectToCanvasDistance(lineWidth);
//         c.strokeStyle = strokeStyle;
//         c.stroke();
//     }

const renderCanvas = async () => {
  if (!canvasWrapper.value || !svgRef.value) {
    return;
  }
  // svgRef.value.width = svgRef.value?.getBoundingClientRect().width;
  // svgRef.value.height = svgRef.value?.getBoundingClientRect().height;
  // const ctx = canvasContext.value;

  // if (ctx) {
  //   ctx.fillStyle = "white";
  //   ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  //   document.value.render(ctx);
  // }
};

watch(
  document,
  () => {
    // console.log(document.value.shapes);
  },
  { immediate: true, deep: true },
);

useResizeObserver(canvasWrapper, () => {});
// onMounted(async () => {
//   await nextTick();
//   renderCanvas();
// });
const svgViewbox = computed(() => {
  const size = document.value.svgSize();
  const center = document.value.canvasToObjectCoords(new Vec2());
  const height = size.y / document.value.zoom;
  const width = size.x / document.value.zoom;
  return `${center.x} ${center.y} ${width} ${height}`;
});
</script>

<template>
  <div ref="canvasWrapper" class="relative w-full h-full flex">
    <Toolbar v-model:selected-tool="selectedToolId" />
    <svg
      ref="svgRef"
      class="w-full h-full select-none bg-white"
      :viewBox="svgViewbox"
      @keydown="handleKeyUp"
      @keyup="handleKeyDown"
      @pointercancel="pointerUpHandler($event, 'leave')"
      @pointerdown="pointerDownHandler"
      @pointerleave="pointerUpHandler($event, 'leave')"
      @pointermove="pointerMoveHandler"
      @pointerout="pointerUpHandler($event, 'leave')"
      @pointerup="pointerUpHandler($event, 'leave')"
      @wheel="handleWheel"
    >
      <template v-for="shape in document.shapes" :key="shape">
        <path v-if="shape instanceof PathShape" :d="shape.getPathData()" />
        <circle
          v-else-if="shape instanceof CircleShape"
          :cx="shape.center.x"
          :cy="shape.center.y"
          :r="shape.radius"
          fill="red"
        />
      </template>
    </svg>
    <svg class="absolute w-full h-full select-none pointer-events-none">
      <SvgGrid :document="document" />
    </svg>
    <svg
      class="absolute w-full h-full select-none pointer-events-none"
      :viewBox="svgViewbox"
    >
      <path v-if="previewPathData" :d="previewPathData" />
    </svg>
    <!-- <canvas -->
    <!--   ref="canvasRef" -->
    <!--   class="w-full h-full select-none" -->
    <!--   move="onMouseMove" -->
    <!--   tabIndex="0" -->
    <!--   :class="{ -->
    <!--     'cursor-none': document.mouseCursorHidden -->
    <!--   }" -->
    <!--   @keydown="handleKeyUp" -->
    <!--   @keyup="handleKeyDown" -->
    <!--   @mousedown="pointerDownHandler" -->
    <!--   @pointercancel="pointerUpHandler($event, 'leave')" -->
    <!--   @pointerdown="pointerDownHandler" -->
    <!--   @pointerleave="pointerUpHandler($event, 'leave')" -->
    <!--   @pointermove="pointerMoveHandler" -->
    <!--   @pointerout="pointerUpHandler($event, 'leave')" -->
    <!--   @pointerup="pointerUpHandler($event, 'leave')" -->
    <!--   @wheel="handleWheel" -->
    <!-- /> -->
  </div>
</template>

<style scoped>
svg {
  touch-action: none;
}
</style>

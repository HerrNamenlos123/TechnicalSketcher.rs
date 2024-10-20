import {
  LineShape,
  RectangleShape,
  Shape,
  type ShapeClickType,
} from "./Shapes";
import { LineTool, PenTool, SelectTool, Tool } from "./Tools";
import { Vec2 } from "./Vector";

export class TskDocument {
  pan = new Vec2();
  zoom = 10;
  cursorPreviewPos = new Vec2();
  cursorPreviewEnabled = true;
  mouseCursorHidden = true;

  svgRef = null as SVGSVGElement | null;
  shiftPressed = true;
  globalMousePosition = new Vec2();
  rawCursorPosition = new Vec2();

  nav = {
    eventCache: [] as PointerEvent[],
    prevMousePosition: new Vec2(),
    lastAveragePosition: undefined as Vec2 | undefined,
    initialZoomFingerDistance: undefined as number | undefined,
    initialZoomFactor: undefined as number | undefined,
    initialZoomPosition: undefined as Vec2 | undefined,
  };

  shapes = [] as Shape[];
  selectedTool = new LineTool(this) as Tool;

  constructor() {
    this.shapes.push(
      new LineShape(new Vec2(2, 2), new Vec2(6, 4), {
        lineWidth: 0.5,
        lineColor: "green",
        lineCap: "round",
      }),
    );
    this.shapes.push(
      new RectangleShape(
        new Vec2(-2, 4),
        new Vec2(7, 5),
        0.5,
        "green",
        "round",
        "red",
        1,
      ),
    );
  }

  /// =================================================================
  /// ====                Coordinate Conversions                   ====
  /// =================================================================

  globalCoordsToCanvasCoords(coords: Vec2) {
    const r = this.svgRef?.getBoundingClientRect();
    if (!r) {
      throw new Error("FATAL ERROR: In TskDocument, svgRef.value is null!");
    }
    return coords.sub(new Vec2(r.left, r.top));
  }

  mousePosOnCanvas() {
    return this.globalCoordsToCanvasCoords(this.globalMousePosition);
  }

  objectToCanvasCoords(v: Vec2) {
    return v.mul(this.zoom).add(this.pan);
  }

  canvasToObjectCoords(v: Vec2) {
    return v.sub(this.pan).div(this.zoom);
  }

  objectToCanvasDistance(d: number) {
    return d * this.zoom;
  }

  canvasToObjectDistance(d: number) {
    return d / this.zoom;
  }

  cursorPosition() {
    const cursorpos = this.canvasToObjectCoords(this.mousePosOnCanvas());
    // return this.shiftPressed ? cursorpos : cursorpos.round();
    return cursorpos;
  }

  svgSize() {
    const r = this.svgRef?.getBoundingClientRect();
    if (!r) {
      return new Vec2();
    }
    return new Vec2(r.width, r.height);
  }

  /// =================================================================
  /// ====                     Tool Selection                      ====
  /// =================================================================

  selectTool(tool: string): void {
    this.selectedTool.deselectTool();
    switch (tool) {
      case "select":
        this.selectedTool = new SelectTool(this);
        break;

      case "line":
        this.selectedTool = new LineTool(this);
        break;

      case "pen":
        this.selectedTool = new PenTool(this);
        break;

      default:
        console.warn(`'${tool}' is not a valid tool!`);
        this.selectedTool = new SelectTool(this);
    }
  }

  onCursorDown(shapeClickType: ShapeClickType): void {
    this.selectedTool.onCursorDown(this.cursorPosition(), shapeClickType);
  }

  onCursorUp(shapeClickType: ShapeClickType): void {
    this.selectedTool.onCursorUp(this.cursorPosition(), shapeClickType);
  }

  onCursorMove(): void {
    this.selectedTool.onCursorMove(this.cursorPosition());
  }

  handleKey(code: string): void {
    this.selectedTool.handleKey(code);
  }

  addShape(shape: Shape): void {
    this.shapes.push(shape);
  }

  /// =================================================================
  /// ====                        Rendering                        ====
  /// =================================================================

  renderCursorDot(ctx: CanvasRenderingContext2D) {
    const mousePos = this.objectToCanvasCoords(this.cursorPosition());
    const dotSize = 5;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.rect(
      mousePos.x - dotSize / 2,
      mousePos.y - dotSize / 2,
      dotSize,
      dotSize,
    );
    ctx.stroke();
    ctx.fill();
  }

  renderGrid(ctx: CanvasRenderingContext2D) {
    const gridWidth = 0.1;
    const pixelCorrection = 0.5;

    function drawCanvasLine(from: Vec2, to: Vec2) {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.lineWidth = gridWidth;
      ctx.stroke();
    }

    const gridSize = this.objectToCanvasDistance(1);
    for (let x = this.pan.x + gridSize; x < ctx.canvas.width; x += gridSize) {
      drawCanvasLine(new Vec2(x, 0), new Vec2(x, ctx.canvas.height));
    }
    for (let x = this.pan.x; x > 0; x -= gridSize) {
      drawCanvasLine(new Vec2(x, 0), new Vec2(x, ctx.canvas.height));
    }

    for (let y = this.pan.y + gridSize; y < ctx.canvas.height; y += gridSize) {
      drawCanvasLine(
        new Vec2(0, y),
        new Vec2(ctx.canvas.width + pixelCorrection, y + pixelCorrection),
      );
    }
    for (let y = this.pan.y; y > 0; y -= gridSize) {
      drawCanvasLine(
        new Vec2(0, y),
        new Vec2(ctx.canvas.width + pixelCorrection, y + pixelCorrection),
      );
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.renderGrid(ctx);
    this.shapes.map((shape) => shape.renderOnCanvas(this, ctx));
    this.selectedTool.renderOnCanvas(ctx);
    if (this.cursorPreviewEnabled) {
      this.renderCursorDot(ctx);
    }
  }
}

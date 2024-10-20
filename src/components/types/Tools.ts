import type { StrokeOptions } from "perfect-freehand";
import { CircleShape, LineShape, PathShape } from "./Shapes";
import { TskDocument } from "./TskDocument";
import { Vec2 } from "./Vector";
import { reactive } from "vue";

export type MouseButton = "left" | "wheel" | "right";

export abstract class Tool {
  documentRef: TskDocument;
  constructor(documentRef: TskDocument) {
    this.documentRef = documentRef;
  }
  abstract deselectTool(): void;
  abstract onCursorDown(
    position: Vec2,
    button: MouseButton,
    pressure: number,
  ): void;
  abstract onCursorUp(position: Vec2, button: MouseButton): void;
  abstract onCursorMove(position: Vec2, pressure: number): void;
  abstract handleKey(code: string): void;
  abstract renderOnCanvas(context: CanvasRenderingContext2D): void;
}

export class SelectTool extends Tool {
  constructor(documentRef: TskDocument) {
    super(documentRef);
  }

  deselectTool(): void {}

  onCursorDown(position: Vec2, button: MouseButton): void {}
  onCursorUp(position: Vec2, button: MouseButton): void {}

  onCursorMove(position: Vec2): void {}

  handleKey(code: string): void {}

  renderOnCanvas(renderer: CanvasRenderingContext2D): void {}
}

export class LineTool extends Tool {
  preview: LineShape | null;

  constructor(documentRef: TskDocument) {
    super(documentRef);
    this.preview = null;
  }

  deselectTool(): void {}

  onCursorDown(position: Vec2, button: MouseButton): void {
    if (button === "left") {
      if (!this.preview) {
        const lineWidth = 0.1;
        const lineColor = "black";
        const lineCap = "round";
        this.preview = new LineShape(position, position, {
          lineWidth,
          lineColor,
          lineCap,
        });
      } else {
        this.preview.end = position;
        if (!this.preview.start.equal(this.preview.end)) {
          this.documentRef.addShape(this.preview);
        }
        this.preview = null;
      }
    } else if (button === "right") {
      this.preview = null;
    }
  }

  onCursorUp(position: Vec2, button: MouseButton): void {}

  onCursorMove(position: Vec2): void {
    if (this.preview) {
      this.preview.end = position;
    }
  }

  handleKey(code: string): void {
    if (code === "Escape") {
      this.preview = null;
    }
  }

  renderOnCanvas(ctx: CanvasRenderingContext2D): void {
    if (this.preview) {
      this.preview.renderOnCanvas(this.documentRef, ctx);
    }
  }
}

export class PenTool extends Tool {
  options: StrokeOptions = {
    size: 6,
    thinning: 0.5,
    smoothing: 0.8,
    streamline: 0.6,
    easing: (t) => t,
    start: {
      taper: 0,
      easing: (t) => t,
      cap: true,
    },
    end: {
      taper: 0,
      easing: (t) => t,
      cap: true,
    },
    simulatePressure: false,
  };

  path = reactive(new PathShape(this.options));
  mouseDown: boolean;
  tolerance = 0.0;
  debugPoints = true;

  constructor(documentRef: TskDocument) {
    super(documentRef);
    this.mouseDown = false;
  }

  deselectTool(): void {}

  onCursorDown(position: Vec2, button: MouseButton, pressure: number): void {
    if (button === "left") {
      this.mouseDown = true;
      this.path = new PathShape(this.options);
      this.path.setFirstPoint(position, pressure);
    } else if (button === "right") {
    }
  }

  onCursorUp(position: Vec2, button: MouseButton): void {
    if (button === "left") {
      this.mouseDown = false;
      if (this.path.isValid()) {
        this.documentRef.addShape(this.path);
      }
      // if (this.path.isValid()) {
      //   // console.log(this.path.points);
      //   // this.path.simplify(this.tolerance);
      //   // console.log(this.path.points);
      //   this.documentRef.addShape(this.path);
      if (this.debugPoints) {
        for (const [x, y, pressure] of this.path.points) {
          this.documentRef.addShape(
            new CircleShape(new Vec2(x, y), 0.1, {
              lineWidth: 0,
              lineColor: "red",
            }),
          );
        }
      }
      // }
      // this.path = new PathShape();
    } else if (button === "right") {
    }
    this.path = new PathShape(this.options);
    console.log("sds");
  }

  onCursorMove(position: Vec2, pressure: number): void {
    if (this.mouseDown) {
      this.path.appendPoint(position, pressure);
    }
  }

  handleKey(code: string): void {
    if (code === "Escape") {
    }
  }

  getPathData() {
    return this.path.getPathData();
  }

  renderOnCanvas(ctx: CanvasRenderingContext2D): void {
    // this.path.renderOnCanvas(this.documentRef, ctx);
  }
}

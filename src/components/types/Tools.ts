import { LineShape, PathShape } from "./Shapes";
import { TskDocument } from "./TskDocument";
import { Vec2 } from "./Vector";

export type MouseButton = "left" | "wheel" | "right";

export abstract class Tool {
  documentRef: TskDocument;
  constructor(documentRef: TskDocument) {
    this.documentRef = documentRef;
  }
  abstract deselectTool(): void;
  abstract onCursorDown(position: Vec2, button: MouseButton): void;
  abstract onCursorUp(position: Vec2, button: MouseButton): void;
  abstract onCursorMove(position: Vec2): void;
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

  renderOnCanvas(renderer: CanvasRenderer): void {}
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
        console.log(this.preview.end, this.preview.start);
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
  path: PathShape;
  mouseDown: boolean;
  tolerance = 0.0;

  constructor(documentRef: TskDocument) {
    super(documentRef);
    this.path = new PathShape();
    this.mouseDown = false;
  }

  deselectTool(): void {}

  onCursorDown(position: Vec2, button: MouseButton): void {
    if (button === "left") {
      this.mouseDown = true;
    } else if (button === "right") {
    }
  }

  onCursorUp(position: Vec2, button: MouseButton): void {
    if (button === "left") {
      this.mouseDown = false;
      if (this.path.isValid()) {
        // console.log(this.path.points);
        this.path.simplify(this.tolerance);
        // console.log(this.path.points);
        this.documentRef.addShape(this.path);
      }
      this.path = new PathShape();
    } else if (button === "right") {
    }
  }

  onCursorMove(position: Vec2): void {
    if (this.mouseDown) {
      this.path.updatePathEnd(position);
    }
  }

  handleKey(code: string): void {
    if (code === "Escape") {
    }
  }

  renderOnCanvas(ctx: CanvasRenderingContext2D): void {
    this.path.renderOnCanvas(this.documentRef, ctx);
  }
}

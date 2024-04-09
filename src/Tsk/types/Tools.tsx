import { CanvasRenderer } from "../components/SketchEditor/CanvasRenderer";
import { LineShape, Shape } from "./Shapes";
import TskDocument from "./TskDocument";
import Vec2 from "./Vector";

export type ShapeClickType = "left" | "wheel" | "right";

export abstract class Tool {
    documentRef: TskDocument;
    constructor(documentRef: TskDocument) {
        this.documentRef = documentRef;
    }
    abstract handleClick(position: Vec2, shapeClickType: ShapeClickType): void;
    abstract updateCursor(position: Vec2): void;
    abstract handleKey(code: string): void;
    abstract renderOnCanvas(context: CanvasRenderer): void;
}

export class SelectTool extends Tool {

    constructor(documentRef: TskDocument) {
        super(documentRef);
    }

    handleClick(position: Vec2, shapeClickType: ShapeClickType): void {
    
    }

    updateCursor(position: Vec2): void {
    
    }

    handleKey(code: string): void {
        this.selectedTool.handleKey(code);
    }

    renderOnCanvas(renderer: CanvasRenderer): void {
    }
}

export class LineTool extends Tool {
    preview: LineShape | null;

    constructor(documentRef: TskDocument) {
        super(documentRef);
        this.preview = null;
    }

    handleClick(position: Vec2, shapeClickType: ShapeClickType): void {
        if (shapeClickType === "left") {
            if (!this.preview) {
                const lineWidth = 0.1;
                const lineColor = "black";
                const lineCap = "round";
                this.preview = new LineShape(position, position, lineWidth, lineColor, lineCap);
            }
            else {
                this.preview.end = position;
                console.log(this.preview.end, this.preview.start);
                if (!this.preview.start.equal(this.preview.end)) {
                    this.documentRef.addShape(this.preview);
                }
                this.preview = null;
            }
        }
        else if (shapeClickType === "right") {
            this.preview = null;
        }
    }

    updateCursor(position: Vec2): void {
        if (this.preview) {
            this.preview.end = position;
        }
    }

    handleKey(code: string): void {
        if (code === "Escape") {
            this.preview = null;
        }
    }

    renderOnCanvas(renderer: CanvasRenderer): void {
        if (this.preview) {
            this.preview.renderOnCanvas(renderer);
        }
    }
}
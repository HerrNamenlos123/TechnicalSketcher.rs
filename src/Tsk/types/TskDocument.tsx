import { CanvasRenderer } from "../components/SketchEditor/CanvasRenderer";
import { LineShape, RectangleShape, Shape, ShapeClickType } from "./Shapes";
import { LineTool, SelectTool, Tool } from "./Tools";
import Vec2 from "./Vector";

class TskDocument {
    shapes: Shape[];
    selectedTool: Tool;

    constructor() {
        this.shapes = [];
        this.selectedTool = new LineTool(this);
        this.cursorPosition = new Vec2();
        this.cursorPositionSmooth = false;

        this.shapes.push(new LineShape(new Vec2(2, 2), new Vec2(6, 4), 0.5, "green", "round"));
        this.shapes.push(new RectangleShape(new Vec2(-2, 4), new Vec2(7, 5), 0.5, "green", "round", "red", 1));
    }

    renderCursorDot(renderer: CanvasRenderer): void {
        const mousePos = renderer.objectToCanvasCoords(this.getCursorPos());
        const dotSize = 5;
        renderer.ctx.strokeStyle = "black";
        renderer.ctx.lineWidth = 1;
        renderer.ctx.fillStyle = "white";
        renderer.ctx.beginPath();
        renderer.ctx.rect(mousePos.x - dotSize / 2, mousePos.y - dotSize / 2, dotSize, dotSize);
        renderer.ctx.stroke();
        renderer.ctx.fill();
    }

    setCursorSmooth(smooth: boolean): void {
        this.cursorPositionSmooth = smooth;
    }

    setRawCursorPos(position: Vec2) {
        this.cursorPosition = position;
    }

    getCursorPos(): Vec2 {
        return this.cursorPositionSmooth ? this.cursorPosition : this.cursorPosition.round();
    }

    render(renderer: CanvasRenderer): void {
        this.shapes.map(shape => shape.renderOnCanvas(renderer));
        this.selectedTool.renderOnCanvas(renderer);
        this.renderCursorDot(renderer);
    }

    handleClick(shapeClickType: ShapeClickType): void {
        this.selectedTool.handleClick(this.getCursorPos(), shapeClickType);
    }

    updateCursor(): void {
        this.selectedTool.updateCursor(this.getCursorPos());
    }

    handleKey(code: string): void {
        this.selectedTool.handleKey(code);
    }

    addShape(shape: Shape): void {
        this.shapes.push(shape);
    }

    private cursorPosition: Vec2;
    private cursorPositionSmooth: boolean;
}

export default TskDocument;

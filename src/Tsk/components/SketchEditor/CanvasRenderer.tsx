import Vec2 from "../../types/Vector";
import SketchEditorState from "./SketchEditor"

export class CanvasRenderer {
    state: SketchEditorState
    ctx: CanvasRenderingContext2D;

    constructor(state: SketchEditorState, ctx: CanvasRenderingContext2D) {
        this.state = state;
        this.ctx = ctx;
    }

    getCanvasContext() {
        return this.ctx;
    }

    drawCircle(position: Vec2, radius: number, lineWidth: number, strokeStyle: string) {
        const c = this.ctx;
        const p = this.objectToCanvasCoords(position);
        const r = this.objectToCanvasDistance(radius);

        // Optimize bounding box

        c.beginPath();
        c.arc(p.x, p.y, r, 0, Math.PI * 2);
        c.lineWidth = this.objectToCanvasDistance(lineWidth);
        c.strokeStyle = strokeStyle;
        c.stroke();
    }

    renderGrid() {
        const c = this.ctx;

        // Vertical lines
        c.beginPath();
        c.moveTo(this.state.pan.x, 0);
        c.lineTo(this.state.pan.x, c.canvas.height);
        c.strokeStyle = "black";
        c.lineWidth = 1
        c.stroke();

        const gridSize = this.objectToCanvasDistance(1);
        let index = 1;
        for (let x = this.state.pan.x; x < c.canvas.width; x += gridSize) {
            c.beginPath();
            c.moveTo(x, 0);
            c.lineTo(x, c.canvas.height);
            c.stroke();
            c.lineWidth = (index % 10 == 0) ? 1 : 0.4;
            index++;
        }
        index = 1;
        for (let x = this.state.pan.x; x > 0; x -= gridSize) {
            c.beginPath();
            c.moveTo(x, 0);
            c.lineTo(x, c.canvas.height);
            c.stroke();
            c.lineWidth = (index % 10 == 0) ? 1 : 0.4;
            index++;
        }
        
        // Horizontal lines
        c.beginPath();
        c.moveTo(0, this.state.pan.y);
        c.lineTo(c.canvas.width, this.state.pan.y);
        c.stroke();

        index = 1;
        for (let y = this.state.pan.y; y < c.canvas.height; y += gridSize) {
            c.beginPath();
            c.moveTo(0, y);
            c.lineTo(c.canvas.width, y);
            c.stroke();
            c.lineWidth = (index % 10 == 0) ? 1 : 0.4;
            index++;
        }
        index = 1;
        for (let y = this.state.pan.y; y > 0; y -= gridSize) {
            c.beginPath();
            c.moveTo(0, y);
            c.lineTo(c.canvas.width, y);
            c.stroke();
            c.lineWidth = (index % 10 == 0) ? 1 : 0.4;
            index++;
        }
    }

    objectToCanvasCoords(v: Vec2): Vec2 {
        return v.mul(this.state.zoom).add(this.state.pan);
    }
    
    canvasToObjectCoords(v: Vec2): Vec2 {
        return v.sub(this.state.pan).div(this.state.zoom);
    }

    objectToCanvasDistance(d: number): number {
        return d * this.state.zoom;
    }

    canvasToObjectDistance(d: number): number {
        return d / this.state.zoom;
    }

    renderCanvas(state: SketchEditorState) {
        this.state = state;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.renderGrid();
        this.state.__document.render(this);
    };
}
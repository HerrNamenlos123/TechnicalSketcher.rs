import { CanvasRenderer } from "../components/SketchEditor/CanvasRenderer";
import BoundingBox from "./BoundingBox";
import Vec2 from "./Vector";

export abstract class Shape {
    abstract getBoundingBox(): BoundingBox;
    abstract renderOnCanvas(context: CanvasRenderer): void;
}

export class LineShape extends Shape {
    start: Vec2;
    end: Vec2;
    lineWidth: number;
    lineColor: string;
    lineCap: CanvasLineCap;

    constructor(start: Vec2, end: Vec2, lineWidth: number, lineColor: string, lineCap: CanvasLineCap) {
        super();
        this.start = start;
        this.end = end;
        this.lineWidth = lineWidth;
        this.lineColor = lineColor;
        this.lineCap = lineCap;
    }

    getBoundingBox(): BoundingBox {
        const left = Math.min(this.start.x, this.end.x);
        const right = Math.max(this.start.x, this.end.x);
        const top = Math.min(this.start.y, this.end.y);
        const bottom = Math.max(this.start.y, this.end.y);
        const radius = this.lineWidth / 2;
        return new BoundingBox(new Vec2(left - radius, top - radius), new Vec2(right + radius, bottom + radius));
    }

    renderOnCanvas(renderer: CanvasRenderer): void {
        const ctx = renderer.getCanvasContext();
        const start = renderer.objectToCanvasCoords(this.start);
        const end = renderer.objectToCanvasCoords(this.end);
        ctx.beginPath();
        ctx.strokeStyle = this.lineColor;
        ctx.lineCap = this.lineCap;
        ctx.lineWidth = renderer.objectToCanvasDistance(this.lineWidth);
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }
}

export class RectangleShape extends Shape {
    leftUpper: Vec2;
    size: Vec2;
    lineWidth: number;
    lineColor: string;
    lineCap: CanvasLineCap;
    fillColor: string;
    cornerRadius: number;

    constructor(leftUpper: Vec2, size: Vec2, lineWidth: number, lineColor: string, lineCap: CanvasLineCap, fillColor: string, cornerRadius: number) {
        super();
        this.leftUpper = leftUpper;
        this.size = size;
        this.lineWidth = lineWidth;
        this.lineColor = lineColor;
        this.lineCap = lineCap;
        this.fillColor = fillColor;
        this.cornerRadius = cornerRadius;
    }

    getBoundingBox(): BoundingBox {
        const left = Math.min(this.leftUpper.x, this.leftUpper.x + this.size.x);
        const right = Math.max(this.leftUpper.x, this.leftUpper.x + this.size.x);
        const top = Math.min(this.leftUpper.y, this.leftUpper.y + this.size.y);
        const bottom = Math.max(this.leftUpper.y, this.leftUpper.y + this.size.y);
        const radius = this.lineWidth / 2;
        return new BoundingBox(new Vec2(left - radius, top - radius), new Vec2(right + radius, bottom + radius));
    }

    renderOnCanvas(renderer: CanvasRenderer): void {
        const ctx = renderer.getCanvasContext();
        const start = renderer.objectToCanvasCoords(this.leftUpper);
        const size = new Vec2(renderer.objectToCanvasDistance(this.size.x), renderer.objectToCanvasDistance(this.size.y));
        const radius = renderer.objectToCanvasDistance(this.cornerRadius);
        ctx.beginPath();
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.lineColor;
        ctx.lineCap = this.lineCap;
        ctx.lineWidth = renderer.objectToCanvasDistance(this.lineWidth);
        ctx.roundRect(start.x, start.y, size.x, size.y, radius);
        ctx.fill();
        ctx.stroke();
    }
}
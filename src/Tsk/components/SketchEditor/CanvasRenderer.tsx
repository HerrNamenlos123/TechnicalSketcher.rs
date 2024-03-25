import Vec2 from "../../types/Vector";

export class CanvasRenderer {
    pan: Vec2;
    zoom: number;
    ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.pan = new Vec2();
        this.zoom = 1;
        this.ctx = ctx;
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

    drawShapes() {
        const c = this.ctx;
        c.fillStyle = "red";
        c.beginPath();
        const s = this.objectToCanvasCoords(new Vec2(100, 100));
        c.arc(s.x, s.y, 50 * this.zoom, 0, Math.PI * 2);
        c.fill();

        this.drawCircle(new Vec2(150, 150), 5, 1, "blue");

        
        for (var x = 0; x < 100; x += 10) {
            for (var y = 0; y < 100; y += 10) {
                this.drawCircle(new Vec2(x, y), 3, 1, "green");
            }
        }
    }

    objectToCanvasCoords(v: Vec2): Vec2 {
        return v.mul(this.zoom).add(this.pan);
    }
    
    canvasToObjectCoords(v: Vec2): Vec2 {
        return v.sub(this.pan).div(this.zoom);
    }

    objectToCanvasDistance(d: number): number {
        return d * this.zoom;
    }

    canvasToObjectDistance(d: number): number {
        return d / this.zoom;
    }

    renderCanvas(pan: Vec2, zoom: number) {
        this.pan = pan;
        this.zoom = zoom;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.drawShapes();
    };
}
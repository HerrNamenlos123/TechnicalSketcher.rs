import Vec2 from "../../types/Vector";

export class CanvasRenderer {

    drawShapes() {

    }

    renderCanvas(ctx: CanvasRenderingContext2D, pan: Vec2, zoom: number) {
        const objectToCanvasCoords = (v: Vec2): Vec2 => {
            return v.mul(zoom).add(pan);
        }
        const canvasToObjectCoords = (v: Vec2): Vec2 => {
            return v.sub(pan).div(zoom);
        }

        if (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            ctx.fillStyle = "red";
            ctx.beginPath();
            const s = objectToCanvasCoords(new Vec2(100, 100));
            ctx.arc(s.x, s.y, 50 * zoom, 0, Math.PI * 2);
            ctx.fill();

            
            for (var x = 0; x < 100; x += 10) {
                for (var y = 0; y < 100; y += 10) {
                    const c = objectToCanvasCoords(new Vec2(x, y));
                    if (c.x > 0 && c.x < window.innerWidth && c.y > 0 && c.y < window.innerHeight) {
                        ctx.beginPath();
                        ctx.arc(c.x, c.y, 2 * zoom, 0, Math.PI * 2);
                        ctx.lineWidth = 1 * zoom;
                        ctx.stroke();
                    }
                }
            }
        }
    };
}
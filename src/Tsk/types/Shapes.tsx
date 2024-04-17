import { CanvasRenderer } from "../components/SketchEditor/CanvasRenderer";
import BoundingBox from "./BoundingBox";
import Vec2 from "./Vector";

export type ShapeClickType = "left" | "wheel" | "right";

export abstract class Shape {
    abstract getBoundingBox(): BoundingBox;
    abstract renderOnCanvas(context: CanvasRenderer): void;
}

interface LineShapeProperties {
    lineWidth: number;
    lineColor: string;
    lineCap: CanvasLineCap;
}

class Line {
    start: Vec2;
    end: Vec2;

    constructor(start: Vec2, end: Vec2) {
        this.start = start;
        this.end = end;
    }

    distanceToPoint(point: Vec2): number {
        // https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
        const v = this.start;
        const w = this.end;
        const l2 = Math.pow(w.sub(v).mag(), 2); // i.e. |w-v|^2 - avoid a sqrt
        if (l2 === 0.0) return point.sub(v).mag(); // v == w case
        // Consider the line extending the segment, parameterized as v + t (w - v).
        // We find projection of point p onto the line.
        // It falls where t = [(p-v) . (w-v)] / |w-v|^2
        // We clamp t from [0,1] to handle points outside the segment vw.
        const t = Math.max(0, Math.min(1, point.sub(v).dot(w.sub(v)) / l2));
        const projection = v.add(w.sub(v).mul(t)); // Projection falls on the segment
        return point.sub(projection).mag();
    }
}

export class LineShape extends Shape {
    start: Vec2;
    end: Vec2;
    properties: LineShapeProperties;

    constructor(start: Vec2, end: Vec2, properties: LineShapeProperties) {
        super();
        this.start = start;
        this.end = end;
        this.properties = properties;
    }

    getBoundingBox(): BoundingBox {
        const left = Math.min(this.start.x, this.end.x);
        const right = Math.max(this.start.x, this.end.x);
        const top = Math.min(this.start.y, this.end.y);
        const bottom = Math.max(this.start.y, this.end.y);
        const radius = this.properties.lineWidth / 2;
        return new BoundingBox(
            new Vec2(left - radius, top - radius),
            new Vec2(right + radius, bottom + radius)
        );
    }

    renderOnCanvas(renderer: CanvasRenderer): void {
        const ctx = renderer.getCanvasContext();
        const start = renderer.objectToCanvasCoords(this.start);
        const end = renderer.objectToCanvasCoords(this.end);
        ctx.beginPath();
        ctx.strokeStyle = this.properties.lineColor;
        ctx.lineCap = this.properties.lineCap;
        ctx.lineWidth = renderer.objectToCanvasDistance(
            this.properties.lineWidth
        );
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }
}

interface CircleShapeProperties {
    lineWidth: number;
    lineColor: string;
}

export class CircleShape extends Shape {
    center: Vec2;
    radius: number;
    properties: CircleShapeProperties;

    constructor(
        center: Vec2,
        radius: number,
        properties: CircleShapeProperties
    ) {
        super();
        this.center = center;
        this.radius = radius;
        this.properties = properties;
    }

    getBoundingBox(): BoundingBox {
        return new BoundingBox(new Vec2(), new Vec2());
    }

    renderOnCanvas(renderer: CanvasRenderer): void {
        const ctx = renderer.getCanvasContext();
        const center = renderer.objectToCanvasCoords(this.center);
        const radius = renderer.objectToCanvasDistance(this.radius);
        ctx.beginPath();
        ctx.strokeStyle = this.properties.lineColor;
        ctx.lineWidth = renderer.objectToCanvasDistance(
            this.properties.lineWidth
        );
        ctx.ellipse(center.x, center.y, radius, radius, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
}

export class PathShape extends Shape {
    points: Vec2[];
    lineColor: string;
    lineWidth: number;

    constructor() {
        super();
        this.points = [];
        this.lineColor = "black";
        this.lineWidth = 0.05;
    }

    getBoundingBox(): BoundingBox {
        return new BoundingBox(new Vec2(), new Vec2()); // TODO !!!
    }

    renderOnCanvas(renderer: CanvasRenderer): void {
        console.log(this.points.length);
        if (this.points.length < 2) {
            return;
        }
        // https://www.youtube.com/watch?v=DLsqkWV6Cag
        // Catmull-Rom Splines algorithm
        const points = this.points.map((p) => renderer.objectToCanvasCoords(p));
        const ctx = renderer.ctx;
        ctx.strokeStyle = "black";
        ctx.lineWidth = renderer.objectToCanvasDistance(this.lineWidth);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        console.log(this.points.length);
        if (this.points.length >= 3) {
            for (var i = 1; i < points.length - 2; i++) {
                var xc = (points[i].x + points[i + 1].x) / 2;
                var yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            console.log(i);
            ctx.quadraticCurveTo(
                points[i].x,
                points[i].y,
                points[i + 1].x,
                points[i + 1].y
            );
        } else {
            ctx.lineTo(points[1].x, points[1].y);
        }
        ctx.stroke();
    }

    updatePathEnd(position: Vec2): void {
        this.points.push(position);
    }

    isValid(): boolean {
        return this.points.length >= 2;
    }

    simplify(tolerance: number): void {
        // https://www.youtube.com/watch?v=SbVXh5VtxKw
        // Ramer-Douglas-Peucker Algorithm

        const ramerDouglasPeucker = (
            points: Vec2[],
            tolerance: number
        ): Vec2[] => {
            if (points.length <= 2) {
                return points;
            }

            let newPoints: Vec2[] = []; // make line from start to end
            const line = new Line(points[0], points[points.length - 1]);
            // find the largest distance from intermediate poitns to this line
            let maxDistance = 0;
            let maxDistanceIndex = 0;
            for (let i = 1; i <= points.length - 2; i++) {
                let distance = line.distanceToPoint(points[i]);
                if (distance > maxDistance) {
                    maxDistance = distance;
                    maxDistanceIndex = i;
                }
            }
            // check if the max distance is greater than our tollerance allows
            if (maxDistance >= tolerance) {
                line.distanceToPoint(points[maxDistanceIndex]);
                // include this point in the output
                newPoints = newPoints.concat(
                    ramerDouglasPeucker(
                        points.slice(0, maxDistanceIndex + 1),
                        tolerance
                    )
                );
                // returnPoints.push( points[maxDistanceIndex] );
                newPoints = newPoints.concat(
                    ramerDouglasPeucker(
                        points.slice(maxDistanceIndex, points.length),
                        tolerance
                    )
                );
            } else {
                // ditching this point
                line.distanceToPoint(points[maxDistanceIndex]);
                newPoints = [points[0]];
            }
            return newPoints;
        };

        const newPoints = ramerDouglasPeucker(this.points, tolerance);
        // always have to push the very last point on so it doesn't get left off
        newPoints.push(this.points[this.points.length - 1]);
        this.points = newPoints;
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

    constructor(
        leftUpper: Vec2,
        size: Vec2,
        lineWidth: number,
        lineColor: string,
        lineCap: CanvasLineCap,
        fillColor: string,
        cornerRadius: number
    ) {
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
        const right = Math.max(
            this.leftUpper.x,
            this.leftUpper.x + this.size.x
        );
        const top = Math.min(this.leftUpper.y, this.leftUpper.y + this.size.y);
        const bottom = Math.max(
            this.leftUpper.y,
            this.leftUpper.y + this.size.y
        );
        const radius = this.lineWidth / 2;
        return new BoundingBox(
            new Vec2(left - radius, top - radius),
            new Vec2(right + radius, bottom + radius)
        );
    }

    renderOnCanvas(renderer: CanvasRenderer): void {
        const ctx = renderer.getCanvasContext();
        const start = renderer.objectToCanvasCoords(this.leftUpper);
        const size = new Vec2(
            renderer.objectToCanvasDistance(this.size.x),
            renderer.objectToCanvasDistance(this.size.y)
        );
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

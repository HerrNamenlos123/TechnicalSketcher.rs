import getStroke, { type StrokeOptions } from "perfect-freehand";
import { BoundingBox } from "./BoundingBox";
import type { TskDocument } from "./TskDocument";
import { Vec2 } from "./Vector";
import { PenTool } from "./Tools";

export type ShapeClickType = "left" | "wheel" | "right";

export abstract class Shape {
  abstract getBoundingBox(): BoundingBox;
  abstract renderOnCanvas(
    documentRef: TskDocument,
    ctx: CanvasRenderingContext2D,
  ): void;
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
      new Vec2(right + radius, bottom + radius),
    );
  }

  renderOnCanvas(
    documentRef: TskDocument,
    ctx: CanvasRenderingContext2D,
  ): void {
    const start = documentRef.objectToCanvasCoords(this.start);
    const end = documentRef.objectToCanvasCoords(this.end);
    ctx.beginPath();
    ctx.strokeStyle = this.properties.lineColor;
    ctx.lineCap = this.properties.lineCap;
    ctx.lineWidth = documentRef.objectToCanvasDistance(
      this.properties.lineWidth,
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

  constructor(center: Vec2, radius: number, properties: CircleShapeProperties) {
    super();
    this.center = center;
    this.radius = radius;
    this.properties = properties;
  }

  getBoundingBox(): BoundingBox {
    return new BoundingBox(new Vec2(), new Vec2());
  }

  renderOnCanvas(
    documentRef: TskDocument,
    ctx: CanvasRenderingContext2D,
  ): void {
    const center = documentRef.objectToCanvasCoords(this.center);
    const radius = documentRef.objectToCanvasDistance(this.radius);
    ctx.beginPath();
    ctx.strokeStyle = this.properties.lineColor;
    ctx.lineWidth = documentRef.objectToCanvasDistance(
      this.properties.lineWidth,
    );
    ctx.ellipse(center.x, center.y, radius, radius, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export class PathShape extends Shape {
  points = [] as [number, number, number][];
  lineColor = "black";
  options: StrokeOptions;

  constructor(options: StrokeOptions) {
    super();
    this.options = options;
  }

  getBoundingBox(): BoundingBox {
    return new BoundingBox(new Vec2(), new Vec2()); // TODO !!!
  }

  renderOnCanvas(
    documentRef: TskDocument,
    ctx: CanvasRenderingContext2D,
  ): void {
    //   if (this.points.length < 2) {
    //     return;
    //   }
    //   // https://www.youtube.com/watch?v=DLsqkWV6Cag
    //   // Catmull-Rom Splines algorithm
    //   const points = this.points.map((p) => documentRef.objectToCanvasCoords(p));
    //   ctx.strokeStyle = "black";
    //   ctx.lineWidth = documentRef.objectToCanvasDistance(this.lineWidth);
    //   ctx.beginPath();
    //   ctx.moveTo(points[0].x, points[0].y);
    //   if (this.points.length >= 3) {
    //     for (var i = 1; i < points.length - 2; i++) {
    //       const xc = (points[i].x + points[i + 1].x) / 2;
    //       const yc = (points[i].y + points[i + 1].y) / 2;
    //       ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    //     }
    //     ctx.quadraticCurveTo(
    //       points[i].x,
    //       points[i].y,
    //       points[i + 1].x,
    //       points[i + 1].y,
    //     );
    //   } else {
    //     ctx.lineTo(points[1].x, points[1].y);
    //   }
    //   ctx.stroke();
  }

  setFirstPoint(position: Vec2, pressure: number): void {
    this.points = [[position.x, position.y, pressure]];
  }

  appendPoint(position: Vec2, pressure: number): void {
    this.points.push([position.x, position.y, pressure]);
  }

  clearPoints() {
    this.points = [];
  }

  isValid(): boolean {
    return this.points.length >= 2;
  }

  getSvgPathFromStroke(stroke: number[][]) {
    if (!stroke.length) return "";

    // 'd' will store the SVG path data
    const svgPathData = stroke.reduce(
      (path, [x0, y0], i, points) => {
        // Current point (x0, y0)
        // Next point (x1, y1) - wrapping around to the first point if at the end
        const [x1, y1] = points[(i + 1) % points.length];

        // Push current point and the midpoint between the current and next points
        // The midpoint is used to smooth the curve
        const p1 = new Vec2(x0, y0);
        const p2 = new Vec2((x0 + x1) / 2, (y0 + y1) / 2);
        path.push(p1.x, p1.y, p2.x, p2.y);
        return path;
      },
      // Start the path with "M" (move to) and the first point, followed by "Q" (quadratic curve)
      ["M", ...stroke[0], "Q"],
    );

    svgPathData.push("Z");

    // Join the path array into a string and return it
    return svgPathData.join(" ");
  }

  getSvgPreviewPathFromStroke(documentRef: TskDocument, stroke: number[][]) {
    if (!stroke.length) return "";

    // 'd' will store the SVG path data
    const svgPathData = stroke.reduce(
      (path, [x0, y0], i, points) => {
        // Current point (x0, y0)
        // Next point (x1, y1) - wrapping around to the first point if at the end
        const [x1, y1] = points[(i + 1) % points.length];

        // Push current point and the midpoint between the current and next points
        // The midpoint is used to smooth the curve
        const p1 = documentRef.canvasToObjectCoords(new Vec2(x0, y0));
        const p2 = documentRef.canvasToObjectCoords(
          new Vec2((x0 + x1) / 2, (y0 + y1) / 2),
        );
        path.push(p1.x, p1.y, p2.x, p2.y);
        return path;
      },
      // Start the path with "M" (move to) and the first point, followed by "Q" (quadratic curve)
      ["M", ...stroke[0], "Q"],
    );

    svgPathData.push("Z");

    // Join the path array into a string and return it
    return svgPathData.join(" ");
  }

  getPathData() {
    return this.getSvgPathFromStroke(getStroke(this.points, this.options));
  }

  getPreviewPathData(documentRef: TskDocument) {
    return this.getSvgPreviewPathFromStroke(
      documentRef,
      getStroke(this.points, this.options),
    );
  }

  simplify(tolerance: number): void {
    // https://www.youtube.com/watch?v=SbVXh5VtxKw
    // Ramer-Douglas-Peucker Algorithm

    if (tolerance === 0.0) {
      return;
    }

    const ramerDouglasPeucker = (
      points: [number, number, number][],
      tolerance: number,
    ): [number, number, number][] => {
      if (points.length <= 2) {
        return points;
      }

      let newPoints: [number, number, number][] = []; // make line from start to end
      const line = new Line(
        new Vec2(points[0][0], points[0][1]),
        new Vec2(points[points.length - 1][0], points[points.length - 1][1]),
      );
      // find the largest distance from intermediate poitns to this line
      let maxDistance = 0;
      let maxDistanceIndex = 0;
      for (let i = 1; i <= points.length - 2; i++) {
        const distance = line.distanceToPoint(
          new Vec2(points[i][0], points[i][1]),
        );
        if (distance > maxDistance) {
          maxDistance = distance;
          maxDistanceIndex = i;
        }
      }
      // check if the max distance is greater than our tollerance allows
      if (maxDistance >= tolerance) {
        line.distanceToPoint(
          new Vec2(points[maxDistanceIndex][0], points[maxDistanceIndex][1]),
        );
        // include this point in the output
        newPoints = newPoints.concat(
          ramerDouglasPeucker(points.slice(0, maxDistanceIndex + 1), tolerance),
        );
        // returnPoints.push( points[maxDistanceIndex] );
        newPoints = newPoints.concat(
          ramerDouglasPeucker(
            points.slice(maxDistanceIndex, points.length),
            tolerance,
          ),
        );
      } else {
        // ditching this point
        line.distanceToPoint(
          new Vec2(points[maxDistanceIndex][0], points[maxDistanceIndex][1]),
        );
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
    cornerRadius: number,
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
    const right = Math.max(this.leftUpper.x, this.leftUpper.x + this.size.x);
    const top = Math.min(this.leftUpper.y, this.leftUpper.y + this.size.y);
    const bottom = Math.max(this.leftUpper.y, this.leftUpper.y + this.size.y);
    const radius = this.lineWidth / 2;
    return new BoundingBox(
      new Vec2(left - radius, top - radius),
      new Vec2(right + radius, bottom + radius),
    );
  }

  renderOnCanvas(
    documentRef: TskDocument,
    ctx: CanvasRenderingContext2D,
  ): void {
    const start = documentRef.objectToCanvasCoords(this.leftUpper);
    const size = new Vec2(
      documentRef.objectToCanvasDistance(this.size.x),
      documentRef.objectToCanvasDistance(this.size.y),
    );
    const radius = documentRef.objectToCanvasDistance(this.cornerRadius);
    ctx.beginPath();
    ctx.fillStyle = this.fillColor;
    ctx.strokeStyle = this.lineColor;
    ctx.lineCap = this.lineCap;
    ctx.lineWidth = documentRef.objectToCanvasDistance(this.lineWidth);
    ctx.roundRect(start.x, start.y, size.x, size.y, radius);
    ctx.fill();
    ctx.stroke();
  }
}

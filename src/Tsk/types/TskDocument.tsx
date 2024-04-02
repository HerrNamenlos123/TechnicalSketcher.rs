import { CanvasRenderer } from "../components/SketchEditor/CanvasRenderer";
import { LineShape, RectangleShape, Shape } from "./Shapes";
import Vec2 from "./Vector";

class TskDocument {
    shapes: Shape[];

    constructor() {
        this.shapes = [];

        this.shapes.push(new LineShape(new Vec2(2, 2), new Vec2(6, 4), 0.5, "green", "round"));
        this.shapes.push(new RectangleShape(new Vec2(-2, 4), new Vec2(7, 5), 0.5, "green", "round", "red", 1));
    }

    renderShapes(renderer: CanvasRenderer): void {
        this.shapes.map(shape => shape.renderOnCanvas(renderer));
    }
}

export default TskDocument;

import { Vec2 } from "./Vector";

export class BoundingBox {
    min: Vec2;
    max: Vec2;

    constructor(min: Vec2, max: Vec2) {
        this.min = min;
        this.max = max;
    }

    getCenter(): Vec2 {
        return this.min.add(this.max).div(2);
    }
}


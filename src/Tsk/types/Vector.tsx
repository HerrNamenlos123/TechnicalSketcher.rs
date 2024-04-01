class Vec2 {
    x: number;
    y: number;

    constructor(x?: number, y?: number) {
        this.x = x ?? 0;
        this.y = y ?? 0;
    }

    add(other: Vec2): Vec2 {
        return new Vec2(this.x + other.x, this.y + other.y);
    }

    sub(other: Vec2): Vec2 {
        return new Vec2(this.x - other.x, this.y - other.y);
    }

    mul(n: Vec2): Vec2;
    mul(n: number): Vec2;
    mul(n: Vec2 | number) {
        if (typeof n === "number") {
            return new Vec2(this.x * n, this.y * n);
        } else {
            return new Vec2(this.x * n.x, this.y * n.y);
        }
    }

    div(n: number): Vec2;
    div(n: Vec2): Vec2;
    div(n: Vec2 | number): Vec2 {
        if (typeof n === "number") {
            return new Vec2(this.x / n, this.y / n);
        } else {
            return new Vec2(this.x / n.x, this.y / n.y);
        }
    }

    neg(): Vec2 {
        return new Vec2(-this.x, -this.y);
    }

    mag(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
}
export default Vec2;

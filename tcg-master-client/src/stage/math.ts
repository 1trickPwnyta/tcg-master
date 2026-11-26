import { STAGE_SIZE } from "./stage";

export class Vector {
    public x: number;
    public y: number;

    public constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public translate(x: number, y: number): Vector {
        return new Vector(this.x + x, this.y + y);
    }

    public half(): Vector {
        return new Vector(this.x / 2, this.y / 2);
    }

    public invert(): Vector {
        return new Vector(STAGE_SIZE.x - this.x, STAGE_SIZE.y - this.y);
    }
};

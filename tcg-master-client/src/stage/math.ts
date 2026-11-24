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
};

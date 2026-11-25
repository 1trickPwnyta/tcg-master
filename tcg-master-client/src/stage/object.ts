import $ from "jquery";
import { Vector } from "./math";
import { Perspective, Stage } from "./stage";

export class StageObject {
    public readonly stage: Stage;
    public readonly element: JQuery<HTMLElement>;
    public position: Vector = new Vector();
    public perspective: Perspective = Perspective.Favoring;
    public neverFlip: boolean = false;

    public get actualPosition(): Vector {
        return this.perspective === Perspective.Favoring ? this.position : this.position.invert();
    }

    public constructor(stage: Stage, className: string) {
        this.stage= stage;
        this.element = $("<div>", { class: `object ${className}` });
        this.stage.element.append(this.element);
    }

    public draw() {
        const position = this.perspective === Perspective.Favoring ? this.position : this.position.invert();
        const scale = this.perspective === Perspective.Favoring || this.neverFlip ? 1 : -1;
        this.element.css({
            left: `${position.x}px`,
            top: `${position.y}px`,
            scale: `${scale} ${scale}`
        });
    }

    public remove() {
        this.element.remove();
    }
};

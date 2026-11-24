import $ from "jquery";
import { Vector } from "./math";
import { STAGE_HEIGHT, STAGE_WIDTH } from "./stage";

export class StageObject {
    public readonly element: JQuery<HTMLElement>;

    public constructor(className: string) {
        this.element = $("<div>", { class: className });
    }

    public draw(stage: JQuery<HTMLElement>, position: Vector) {
        this.element.css({
            left: `${position.x}px`,
            top: `${position.y}px`
        });
        stage.append(this.element);
    }

    public drawOpposing(stage: JQuery<HTMLElement>, position: Vector) {
        this.element.css({
            scale: "-1 -1"
        });
        this.draw(stage, new Vector(STAGE_WIDTH - position.x, STAGE_HEIGHT - position.y));
    }
};

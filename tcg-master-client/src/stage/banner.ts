import { StageObject } from "./object";
import { STAGE_SIZE, type Stage } from "./stage";

export class Banner extends StageObject {
    public override persistent: boolean = true;
    private readonly callback: () => void;
    public permanent: boolean = false;

    public constructor(stage: Stage, message: string, callback: () => void) {
        super(stage, "banner");
        this.callback = callback;
        this.element.text(message);
        this.element.css("opacity", 0);
        this.position = STAGE_SIZE.half();
    }

    public override draw() {
        super.draw();
        const This = this;
        this.element.fadeTo(500, 1, function() {
            setTimeout(() => {
                This.element.fadeTo(500, 0, function() {
                    if (!This.permanent) This.remove();
                    This.callback();
                });
            }, 1000);
        });
        
    }
};

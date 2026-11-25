import "jquery.easing";
import type { PokemonCard } from "../cards";
import { StageObject } from "../object";
import { EventHandler } from "./EventHandler";
import { CARD_SIZE } from "../stage";

export class EventHandler_Damage extends EventHandler {
    public onEvent(args: { receiver: number, amount: number }, callback: () => void) {
        const card = this.stage.getCard(args.receiver) as PokemonCard;
        const effect = new StageObject(this.stage, "damage");
        effect.position = card.position;
        effect.perspective = card.perspective;
        effect.neverFlip = true;
        effect.draw();
        effect.element.on("animationend", () => effect.remove());
        setTimeout(() => {
            const number = new StageObject(this.stage, "damage-number");
            number.element.text(args.amount.toString());
            number.position = card.position;
            number.perspective = card.perspective;
            number.neverFlip = true;
            number.draw();
            number.element.animate({
                top: `${number.actualPosition.y - CARD_SIZE.y / 3}px`
            }, 2000, "easeOutCubic");
            setTimeout(() => {
                card.damage += args.amount;
                card.draw();
                number.element.fadeOut(500, function() { number.remove(); });
                callback();
            }, 1500);
        }, 200);
    }
};

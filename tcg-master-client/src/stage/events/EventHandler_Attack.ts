import { Vector } from "../math";
import { CARD_SIZE } from "../stage";
import { EventHandler } from "./EventHandler";

export class EventHandler_Attack extends EventHandler {
    public onEvent(args: {  attacker: number }, callback: () => void) {
        const attacker = this.stage.getCard(args.attacker);
        console.log(attacker);
        if (attacker) {
            const position = attacker.actualPosition;
            attacker.element.animate({
                top: `${attacker.perspectivePosition(new Vector(attacker.position.x, attacker.position.y - CARD_SIZE.y / 10)).y}px`
            }, 100, function() { callback(); }).animate({
                top: `${position.y}px`
            }, 200);
        }
    }
};

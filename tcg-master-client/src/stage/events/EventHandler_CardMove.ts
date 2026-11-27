import { Card, type PokemonCard } from "../cards";
import { Vector } from "../math";
import { ACTIVE_POSITION, BENCH_POSITION, CARD_SIZE, Perspective, STAGE_SIZE } from "../stage";
import type { CardState, PokemonCardState } from "../state";
import { EventHandler } from "./EventHandler";

export type Location = "active" | "bench" | "discard" | "deck" | "prizes" | "hand" | number | undefined;

export class EventHandler_CardMove extends EventHandler {
    public override onEvent(args: { owner: number, mover: CardState, from: Location, to: Location }, callback: () => void) {
        let targetPosition;
        let attachedToCard: PokemonCard | undefined;
        if (typeof args.to === "number") {
            attachedToCard = this.stage.getCard(args.to) as PokemonCard | undefined;
            targetPosition = attachedToCard?.position;
        } else {
            switch (args.to) {
                case "active": targetPosition = ACTIVE_POSITION; break;
                case "bench": targetPosition = BENCH_POSITION; break;
                default: console.error(`No handler for location ${args.to}.`); break;
            }
        }

        let attachedFromCard: PokemonCard | undefined;
        if (typeof args.from === "number") {
            attachedFromCard = this.stage.getCard(args.from) as PokemonCard | undefined;
        }
        
        if (targetPosition) {
            if (!this.stage.isMe(args.owner)) {
                targetPosition = targetPosition.invert();
            }

            let card = this.stage.getCard(args.mover.id);
            if (!card) {
                card = new Card(this.stage, args.mover);
                card.position = new Vector(STAGE_SIZE.x / 2, STAGE_SIZE.y + CARD_SIZE.y / 2);
                if (!this.stage.isMe(args.owner)) {
                    card.perspective = Perspective.Opposing;
                }
                card.draw();
            }

            const stage = this.stage;
            card.element.animate({
                left: `${targetPosition.x}px`,
                top: `${targetPosition.y}px`
            }, 200, function() {
                card.remove();
                const player = stage.getPlayer(args.owner);
                if (player) {
                    if (attachedFromCard) {
                        attachedFromCard.state.attachments.cards.splice(attachedFromCard.state.attachments.cards.findIndex(c => c.id === args.mover.id), 1);
                    } else if (args.from === "active") {
                        player.active = null;
                    } else if (args.from === "bench") {
                        player.bench.splice(player.bench.findIndex((c: CardState) => c.id === args.mover.id), 1);
                    }

                    if (attachedToCard) {
                        attachedToCard.state.attachments.cards.push(args.mover);
                    } else if (args.to === "active") {
                        player.active = args.mover as PokemonCardState;
                    } else if (args.to === "bench") {
                        player.bench.push(args.mover as PokemonCardState);
                    }

                    stage.draw();
                }
                callback();
            });
        } else {
            console.error(`No target position found for mover ${args.mover.name}.`);
            callback();
        }
    }
};

import { Card, type PokemonCard } from "../cards";
import { StageObject } from "../object";
import { ACTIVE_POSITION, BENCH_POSITION, CARD_SIZE, DECK_POSITION, DISCARD_POSITION, HAND_LOCATION as HAND_POSITION, Perspective, PRIZE_POSITION, STAGE_SIZE } from "../stage";
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
                case "hand": targetPosition = HAND_POSITION; break;
                case "discard": targetPosition = DISCARD_POSITION; break;
                case "deck": targetPosition = DECK_POSITION; break;
                case "prizes": targetPosition = PRIZE_POSITION; break;
                default: console.error(`No handler for target location ${args.to}.`); break;
            }
        }

        let sourcePosition;
        let attachedFromCard: PokemonCard | undefined;
        if (typeof args.from === "number") {
            attachedFromCard = this.stage.getCard(args.from) as PokemonCard | undefined;
            sourcePosition = attachedFromCard?.position;
        } else {
            switch (args.from) {
                case "active": sourcePosition = ACTIVE_POSITION; break;
                case "bench": sourcePosition = BENCH_POSITION; break;
                case "hand": sourcePosition = HAND_POSITION; break;
                case "deck": sourcePosition = DECK_POSITION; break;
                case "discard": sourcePosition = DISCARD_POSITION; break;
                case "prizes": sourcePosition = PRIZE_POSITION; break;
                default: console.error(`No handler for source location ${args.from}.`); break;
            }
        }
        
        if (targetPosition && sourcePosition) {
            if (!this.stage.isMe(args.owner)) {
                targetPosition = targetPosition.invert();
            }

            let card = this.stage.getCard(args.mover.id) as StageObject;
            if (!card) {
                if (typeof args.to === "number" || args.to === "discard" || args.to === "active" || args.to === "bench") {
                    card = new Card(this.stage, args.mover);
                } else {
                    card = new StageObject(this.stage, "facedown");
                    card.element.css({
                        width: `${CARD_SIZE.x}px`,
                        height: `${CARD_SIZE.y}px`
                    });
                }
                card.position = sourcePosition;
                if (!this.stage.isMe(args.owner)) {
                    card.perspective = Perspective.Opposing;
                }
                card.draw();
            }

            const stage = this.stage;
            if (attachedFromCard) {
                stage.element.append(card.element);
                card.position = attachedFromCard.position;
                card.perspective = attachedFromCard.perspective;
                card.draw();
            }

            card.element.css("z-index", 1000);
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
                    } else if (args.from === "discard") {
                        player.discard.pop();
                    }

                    if (attachedToCard) {
                        attachedToCard.state.attachments.cards.push(args.mover);
                    } else if (args.to === "active") {
                        player.active = args.mover as PokemonCardState;
                    } else if (args.to === "bench") {
                        player.bench.push(args.mover as PokemonCardState);
                    } else if (args.to === "discard") {
                        player.discard.push(args.mover);
                    }

                    stage.draw();
                }
                callback();
            });
        } else {
            console.error(`Target or source position not found for mover ${args.mover.name}.`);
            callback();
        }
    }
};

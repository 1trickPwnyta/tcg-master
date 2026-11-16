import { GameEngine } from "../engine/GameEngine.js";
import { Card } from "../state/Card.js";
import { InterruptType } from "../state/interrupts/InterruptType.js";
import { Player } from "../state/Player.js";
import { TrainerCard } from "../state/TrainerCard.js";

export class TrainerContext {
    public readonly engine: GameEngine;
    public readonly player: Player;
    public readonly card: TrainerCard;
    public interruptType?: InterruptType;
    public forceInterrupt?: boolean;
    private _targets?: (number | string)[];
    public readonly targets: (number | string | null)[];

    public constructor(engine: GameEngine, card: TrainerCard, ...targets: (number | string)[]) {
        this.engine = engine;
        this.player = engine.game.activePlayer;
        this.card = card;
        this._targets = [ ...targets ];
        this.targets = targets;
    }

    public nextTarget(): number | string | null | undefined {
        if (this._targets!.length) {
            return this._targets!.splice(0, 1)[0];
        } else {
            return undefined;
        }
    }

    public addNullTarget() {
        this.targets.push(null);
    }

    public nextTargetCard(): Card | null {
        const next = this.nextTarget();
        const card = this.engine.search.getCard(next as number);
        return card as Card | null;
    }
};

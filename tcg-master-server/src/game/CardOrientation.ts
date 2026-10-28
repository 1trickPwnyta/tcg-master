import { Card_Pokemon } from "./cards/Card_Pokemon.js";
import { GameEngine } from "./engine/GameEngine.js";

export abstract class CardOrientation {
    public static readonly Normal: CardOrientation = new class extends CardOrientation {
        public override message(card: Card_Pokemon): any[] {
            return [ card.owner, "'s", card, "was cured!" ];
        }

        public toString(): string {
            return "[😊]";
        }
    };

    public static readonly Asleep: CardOrientation = new class extends CardOrientation {
        public override message(card: Card_Pokemon): any[] {
            return [ card.owner, "'s", card, "fell asleep!" ];
        }

        public override get nonattackingReason(): string | null {
            return "sleep";
        }

        public toString(): string {
            return "[💤]";
        }
    };

    public static readonly Confused: CardOrientation = new class extends CardOrientation {
        public override message(card: Card_Pokemon): any[] {
            return [ card.owner, "'s", card, "got confused!" ];
        }

        public toString(): string {
            return "[😵‍💫]";
        }
    };

    public static readonly Paralyzed: CardOrientation = new class extends CardOrientation {
        public override message(card: Card_Pokemon): any[] {
            return [ card.owner, "'s", card, "was paralyzed!" ];
        }

        public override get nonattackingReason(): string | null {
            return "paralysis";
        }

        public override notify_betweenTurns(parent: Card_Pokemon): CardOrientation {
            return parent.game.currentTurn == parent.owner ? CardOrientation.Normal : super.notify_betweenTurns(parent);
        }

        public toString(): string {
            return "[⚡️]";
        }
    };

    public abstract message(card: Card_Pokemon): any[];

    public get nonattackingReason(): string | null {
        return null;
    };

    public notify_betweenTurns(parent: Card_Pokemon): CardOrientation {
        return this;
    }
}

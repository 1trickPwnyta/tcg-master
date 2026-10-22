import { Card_Pokemon } from "./cards/Card_Pokemon.js";

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

        public toString(): string {
            return "[⚡️]";
        }
    };

    public abstract message(card: Card_Pokemon): any[];
}

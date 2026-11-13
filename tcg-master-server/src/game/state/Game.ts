import { AttackResult } from "../attacks/Attack.js";
import { GameEngine } from "../engine/GameEngine.js";
import { Interrupt } from "./interrupts/Interrupt.js";
import { Player } from "./Player.js";
import { PokemonCard } from "./PokemonCard.js";
import { Serializable, SerializationHydrate, SerializationReplace, Serialize } from "./serializer.js";
import { State } from "./State.js";
import { Turn } from "./Turn.js";

@Serializable()
export class Game extends State {
    @Serialize()
    public readonly players: Player[] = [];

    @Serialize()
    public turn: Turn | null = null;

    @Serialize()
    public interrupt: Interrupt | null = null;

    @Serialize()
    public readonly interruptStack: Interrupt[] = [];

    @Serialize()
    public readonly rules: { prizes: number };

    @Serialize()
    public betweenTurns: boolean = false;

    @Serialize()
    public winner_id?: number;

    @Serialize()
    public nextInterrupt_id: number = 1000;

    @Serialize()
    public attackResult?: AttackResult;

    public constructor(engine: GameEngine, rules: { prizes: number }) {
        super(0, engine);
        this.rules = rules;
        this.nextInterrupt_id = 1000;
    }

    public get activePlayer(): Player {
        return this.players.find(p => p.id === this.turn!.player)!;
    }

    public get inactivePlayer(): Player {
        return this.players.find(p => p.id !== this.turn!.player)!;
    }

    public getPlayer(id: number): Player {
        return this.players.find(p => p.id === id)!;
    }

    public get activePokemon(): PokemonCard {
        return this.activePlayer.activePokemon!;
    }

    public get defendingPokemon(): PokemonCard {
        return this.inactivePlayer.activePokemon!;
    }

    public hash(): number {
        const str = JSON.stringify([
            this.players.map(p => [
                p.active,
                [ ...p.bench.cards ].sort((a, b) => a.id - b.id),
                p.limbo,
                [ ...p.hand.cards ].sort((a, b) => a.id - b.id),
                p.discard,
                p.prizes,
                p.deck
            ]),
            this.turn,
            this.winner_id,
            this.interrupt?.player,
            this.interrupt?.prompt,
            this.interrupt?.choices
        ], SerializationReplace);
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 33) ^ str.charCodeAt(i);
        }
        return hash >>> 0;
    }

    public clone(engine: GameEngine): Game {
        const json = JSON.stringify(this, SerializationReplace);
        const raw = JSON.parse(json);
        const hydrated = SerializationHydrate(raw, engine);
        return hydrated;
    }

    public flipCoin(player?: Player): boolean {
        const heads = Math.random() < 0.5;
        if (player) {
            this.engine.send(player, "flipped a coin... It was", heads ? "heads" : "tails", "!");
        } else {
            this.engine.send("A coin was flipped... It was", heads ? "heads" : "tails", "!");
        }
        return heads;
    }

    public update() {
        if (!this.winner_id) {
            if (this.interrupt) {
                this.engine.interrupts.interrupt(this.interrupt);
            } else if (this.interruptStack.length) {
                this.engine.interrupts.interrupt(this.interruptStack.pop()!);
            } else if (!this.turn) {
                this.engine.setup.update();
            } else if (this.betweenTurns) {
                this.engine.turns.begin(this.inactivePlayer.id);
            } else {
                this.engine.turns.update();
            }
        }
    }
};

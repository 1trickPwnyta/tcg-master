import { AttackResult } from "../attacks/AttackContext.js";
import { GameEngine } from "../engine/GameEngine.js";
import { Interrupt, InterruptSync } from "./interrupts/Interrupt.js";
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
    public readonly interruptQueue: Interrupt[] = [];

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
                p.active.cards.map(c => c.hasher),
                [ ...p.bench.cards ].sort((a, b) => a.id - b.id).map(c => c.hasher),
                p.limbo.cards.map(c => c.hasher),
                [ ...p.hand.cards ].sort((a, b) => a.id - b.id).map(c => c.hasher),
                p.discard.cards.map(c => c.hasher),
                p.prizes.cards.map(c => c.hasher),
                p.deck.cards.map(c => c.hasher)
            ]),
            this.turn?.number,
            this.turn?.energyPlayed,
            this.turn?.player,
            this.winner_id,
            this.interrupt?.player,
            this.interrupt?.prompt,
            this.interrupt?.choices?.map(c => [ c.label ])
        ]);
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 33) ^ str.charCodeAt(i);
        }
        return hash >>> 0;
    }

    public activeHash(): number {
        const str = JSON.stringify(this.turn ? [
            this.activePokemon.id,
            this.activePokemon.statuses
        ] : []);
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 33) ^ str.charCodeAt(i);
        }
        return hash >>> 0;
    }

    public getInterrupt(player_id: number, root?: Interrupt): InterruptSync | null {
        if (this.interrupt?.player === player_id) {
            return this.interrupt as InterruptSync;
        } else if (root?.player === player_id) {
            return root as InterruptSync;
        } else {
            const interrupts = (root ?? this.interrupt)?.interrupts;
            if (interrupts) {
                for (const interrupt of interrupts) {
                    if (this.getInterrupt(player_id, interrupt)) {
                        return interrupt as InterruptSync;
                    }
                }
            }
        }
        return null;
    }

    public clone(engine: GameEngine): Game {
        const json = JSON.stringify(this, SerializationReplace);
        const raw = JSON.parse(json);
        const hydrated = SerializationHydrate(raw, engine);
        return hydrated;
    }

    public flipCoin(player?: Player): boolean {
        const heads = { name: "heads", type: "heads" };
        const tails = { name: "tails", type: "tails" };
        const result = Math.random() < 0.5;
        if (player) {
            this.engine.send(player, "flipped a coin... It was", result ? heads : tails, "!");
        } else {
            this.engine.send("A coin was flipped... It was", result ? heads : tails, "!");
        }
        return result;
    }

    public update() {
        if (!this.winner_id) {
            if (this.interrupt) {
                this.engine.interrupts.interrupt(this.interrupt);
            } else if (this.interruptQueue.length) {
                this.engine.interrupts.interrupt(this.interruptQueue.splice(0, 1)[0]);
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

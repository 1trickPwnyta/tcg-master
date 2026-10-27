import { Client_AI } from "../ai/Client_AI.js";
import { GameState } from "./state/GameState.js";
import { Interrupt, InterruptSync } from "./state/Interrupt.js";
import { PlayerState } from "./state/PlayerState.js";
import { CardState } from "./state/CardState.js";
import { CardDatabase } from "./cards/CardDatabase.js";
import { Card_Pokemon_BaseSet_Voltorb } from "./cards/BaseSet/Card_Pokemon_BaseSet_Voltorb.js";
import { CardWorker_Pokemon } from "./cards/CardWorker_Pokemon.js";
import { Client } from "../Client.js";
import { IToken } from "../Token.js";
import { InterruptResolution } from "./InterruptResolution.js";
import { InterruptResolver } from "./InterruptResolver.js";

export class Game {
    private clients: Client[];
    private state: GameState;

    public constructor(client1?: Client, client2?: Client, options: { prizes?: number } = {}) {
        if (client1) {
            client1.game = this;
        } else {
            client1 = new Client_AI(this);
        }
        if (client2) {
            client2.game = this;
        } else {
            client2 = new Client_AI(this);
        }
        this.clients = [ client1, client2 ];
        client1.player_id = crypto.randomUUID();
        client2.player_id = crypto.randomUUID();
        this.state = {
            players: [
                {
                    id: client1.player_id,
                    tokenType: "player",
                    name: "Pikachu",
                    pronouns: { objective: "they", possessive: "their" },
                    active: { id: crypto.randomUUID(), cards: [] },
                    bench: { id: crypto.randomUUID(), cards: [] },
                    hand: { id: crypto.randomUUID(), cards: [] },
                    discard: { id: crypto.randomUUID(), cards: [] },
                    prizes: { id: crypto.randomUUID(), cards: [] },
                    deck: { id: crypto.randomUUID(), cards: [] },
                    mulligans: 0
                },
                {
                    id: client2.player_id,
                    tokenType: "player",
                    name: "COM",
                    pronouns: { objective: "they", possessive: "their" },
                    active: { id: crypto.randomUUID(), cards: [] },
                    bench: { id: crypto.randomUUID(), cards: [] },
                    hand: { id: crypto.randomUUID(), cards: [] },
                    discard: { id: crypto.randomUUID(), cards: [] },
                    prizes: { id: crypto.randomUUID(), cards: [] },
                    deck: { id: crypto.randomUUID(), cards: [] },
                    mulligans: 0
                }
            ],
            turn: null,
            interrupt: null,
            rules: {
                prizes: options.prizes ?? 6
            }
        };
        this.update();
    }

    public getState(): GameState {
        return this.state;
    }

    public getPlayer(player_id: string): PlayerState {
        return this.state.players.find(p => p.id == player_id)!;
    }

    private update() {
        if (this.state.interrupt) {
            this.interrupt(this.state.interrupt);
        } else if (!this.state.turn) {
            this.start();
        } else {
            this.updateMain();
        }
    }

    private start() {
        this.send("Starting game between", this.state.players[0].name, "and", this.state.players[1].name, ".");
        for (const player of this.state.players) {
            for (let i = 0; i < 60; i++) {
                const card: CardState = this.makeCard(CardDatabase.find(Card_Pokemon_BaseSet_Voltorb).dbid);
                player.deck.cards.push(card);
            }
            this.shuffleDeck(player.id);
            player.mulligans = this.setupDraw(player);
        }
        this.interrupt({
            interrupts: this.state.players.map(p => ({
                player: p.id,
                prompt: "Select a basic Pokémon as your active Pokémon.",
                choices: this.basicPokemonInHand(p.id).map(c => ({ text: c.name, target_id: c.id })),
                resolution: InterruptResolution.MoveCard,
                args: [ p.hand.id, p.active.id ]
            }))
        });
    }

    private setupDraw(player: PlayerState, mulligans: number = 0): number {
        this.draw(player.id, 7);
        if (this.basicPokemonInHand(player.id).length) {
            return mulligans;
        } else {
            this.send(player, "has no basic Pokémon in", player.pronouns.possessive, "hand.", player.pronouns.objective.capitalizeFirst(), "must take a mulligan.");
            this.shuffleHandIntoDeck(player.id);
            return this.setupDraw(player, mulligans + 1);
        }
    }

    private updateMain() {
        
    }

    private interrupt(interrupt: Interrupt) {
        interrupt.id = crypto.randomUUID();
        this.state.interrupt = interrupt;
        this.sendInterrupt(interrupt);
    }

    private sendInterrupt(interrupt: Interrupt) {
        if (interrupt.interrupts?.length) {
            for (const sub of interrupt.interrupts) {
                this.sendInterrupt(sub);
            }
        } else {
            this.clients.find(c => c.player_id === interrupt.player)!
                .prompt(interrupt.prompt!, interrupt.choices!.map(c => c.text), interrupt.force);
        }
    }

    public send(...parts: (IToken | string)[]) {
        this.clients.forEach(c => {
            c.send(...parts);
        });
    }

    private makeCard(dbid: string): CardState {
        return {
            id: crypto.randomUUID(),
            dbid: dbid,
            name: CardDatabase.find(dbid).name,
            damage: 0,
            poison: false,
            orientation: "normal",
            attachments: { id: crypto.randomUUID(), cards: [] }
        };
    }

    public getInterrupt(player_id: string, root?: Interrupt): InterruptSync | null {
        if (this.state.interrupt?.player === player_id) {
            return this.state.interrupt as InterruptSync;
        } else if (root?.player === player_id) {
            return root as InterruptSync;
        } else {
            const interrupts = (root ?? this.state.interrupt)?.interrupts;
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

    private closeInterrupt(interrupt_id: string) {
        if (this.state.interrupt?.id === interrupt_id) {
            this.state.interrupt = null;
            return;
        }

        this.closeInterruptRecursive(interrupt_id, this.state.interrupt);
        this.cleanInterrupts(this.state.interrupt);
    }

    private closeInterruptRecursive(interrupt_id: string, root: Interrupt | null) {
        if (root?.interrupts) {
            for (let i = 0; i < root.interrupts.length; i++) {
                if (root.interrupts[i].id === interrupt_id) {
                    root.interrupts.splice(i, 1);
                    return;
                }
                this.closeInterruptRecursive(interrupt_id, root.interrupts[i]);
            }
        }
    }

    private cleanInterrupts(root: Interrupt | null) {
        if (this.state.interrupt?.interrupts && !this.state.interrupt.interrupts.length) {
            this.state.interrupt = null;
            return;
        }
        if (root?.interrupts) {
            for (let i = 0; i < root.interrupts.length; i++) {
                if (root.interrupts[i].interrupts && !root.interrupts[i].interrupts?.length) {
                    root.interrupts.splice(i, 1);
                }
                this.cleanInterrupts(root.interrupts[i]);
            }
        }
    }

    public resolveInterrupt(player_id: string, choice: number | null) {
        const interrupt = this.getInterrupt(player_id);
        if (interrupt) {
            if (choice !== null) {
                InterruptResolver.resolve(this, interrupt, choice);
            }
            this.closeInterrupt(interrupt.id!);
            this.update();
        } else {
            throw new Error(`No interrupt found for player ${player_id}.`)
        }
    }

    public shuffleDeck(player_id: string) {
        const player = this.getPlayer(player_id);
        for (let i = player.deck.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = player.deck.cards[i];
            player.deck.cards[i] = player.deck.cards[j];
            player.deck.cards[j] = temp;
        }
        this.send(player, "shuffled", player.pronouns.possessive, "deck.");
    }

    public shuffleHandIntoDeck(player_id: string) {
        const player = this.getPlayer(player_id);
        while (player.hand.cards.length) {
            player.deck.cards.push(player.hand.cards.pop()!);
        }
        this.shuffleDeck(player_id);
    }

    public draw(player_id: string, amount: number = 1) {
        const player = this.getPlayer(player_id);
        for (let i = 0; i < amount && player.deck.cards.length; i++) {
            player.hand.cards.push(player.deck.cards.pop()!);
        }
    }

    public basicPokemonInHand(player_id: string): CardState[] {
        const player = this.getPlayer(player_id);
        return player.hand.cards.filter(c => {
            const worker = CardDatabase.find(c.dbid)
            if (worker instanceof CardWorker_Pokemon) {
                return worker.evo === "basic";
            }
            return false;
        });
    }
};

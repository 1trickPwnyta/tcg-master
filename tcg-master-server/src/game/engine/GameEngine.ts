import { Client_AI } from "../../ai/Client_AI.js";
import { GameState } from "../state/GameState.js";
import { Interrupt, InterruptSync } from "../state/Interrupt.js";
import { PlayerState } from "../state/PlayerState.js";
import { CardState } from "../state/CardState.js";
import { CardDatabase } from "../cards/CardDatabase.js";
import { CardWorker_Pokemon } from "../cards/CardWorker_Pokemon.js";
import { Client } from "../../Client.js";
import { IToken } from "../../IToken.js";
import { InterruptResolver } from "../InterruptResolver.js";
import { GameWorker_Setup } from "./GameWorker_Setup.js";
import { GameWorker_Turn } from "./GameWorker_Turn.js";
import { LocationState } from "../state/LocationState.js";

export class GameEngine {
    private readonly clients: Client[];
    private state: GameState;

    private readonly setup: GameWorker_Setup;
    private readonly turns: GameWorker_Turn;

    public constructor(client1?: Client, client2?: Client, options: { prizes?: number } = {}) {
        this.setup = new GameWorker_Setup(this);
        this.turns = new GameWorker_Turn(this);

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
                    token: { name: "Pikachu", type: "player" },
                    name: "Pikachu",
                    pronouns: { subjective: "they", possessive: "their" },
                    active: { id: crypto.randomUUID(), cards: [] },
                    bench: { id: crypto.randomUUID(), cards: [] },
                    hand: { id: crypto.randomUUID(), cards: [] },
                    discard: { id: crypto.randomUUID(), cards: [] },
                    prizes: { id: crypto.randomUUID(), cards: [] },
                    deck: { id: crypto.randomUUID(), cards: [] },
                    mulligans: 0,
                    mulliganBonusUsed: false,
                    setupComplete: false
                },
                {
                    id: client2.player_id,
                    token: { name: "COM", type: "player" },
                    name: "COM",
                    pronouns: { subjective: "they", possessive: "their" },
                    active: { id: crypto.randomUUID(), cards: [] },
                    bench: { id: crypto.randomUUID(), cards: [] },
                    hand: { id: crypto.randomUUID(), cards: [] },
                    discard: { id: crypto.randomUUID(), cards: [] },
                    prizes: { id: crypto.randomUUID(), cards: [] },
                    deck: { id: crypto.randomUUID(), cards: [] },
                    mulligans: 0,
                    mulliganBonusUsed: false,
                    setupComplete: false
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

    public flipCoin(player_id?: string): boolean {
        const heads = Math.random() < 0.5;
        if (player_id) {
            this.send(this.getPlayer(player_id), "flipped a coin... It was", heads ? "heads" : "tails", "!");
        } else {
            this.send("A coin was flipped... It was", heads ? "heads" : "tails", "!");
        }
        return heads;
    }

    public update() {
        if (this.state.interrupt) {
            this.interrupt(this.state.interrupt);
        } else if (!this.state.turn) {
            this.setup.update();
        } else {
            this.turns.update();
        }
    }

    public interrupt(interrupt: Interrupt) {
        this.assignInterruptId(interrupt);
        this.state.interrupt = interrupt;
        this.sendInterrupt(interrupt);
    }

    private assignInterruptId(interrupt: Interrupt) {
        if (!interrupt.id) {
            interrupt.id = crypto.randomUUID();
        }
        if (interrupt.interrupts) {
            for (const sub of interrupt.interrupts) {
                this.assignInterruptId(sub);
            }
        }
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

    public send(...parts: any[]) {
        this.clients.forEach(c => {
            c.send(...parts);
        });
    }

    public sendTo(player: PlayerState, ...parts: (IToken | string)[]) {
        this.clients.find(c => c.player_id === player.id)?.send(...parts);
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
            } else if (interrupt.cancelResolution) {
                InterruptResolver.cancel(this, interrupt, player_id);
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
        amount = Math.min(amount, player.deck.cards.length);
        for (let i = 0; i < amount; i++) {
            player.hand.cards.push(player.deck.cards.pop()!);
        }
        this.send(player, "drew", amount, `card${amount > 1 ? "s" : ""}.`)
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

    public get activePlayer(): PlayerState {
        return this.state.players.find(p => p.id === this.state.turn!.player)!;
    }

    public get inactivePlayer(): PlayerState {
        return this.state.players.find(p => p.id !== this.state.turn!.player)!;
    }

    public findCard(card_id: string, root?: LocationState): CardState | null {
        if (!root) {
            for (const player of this.state.players) {
                for (const location of [ player.deck, player.hand, player.active, player.bench, player.discard, player.prizes ]) {
                    const card = this.findCard(card_id, location);
                    if (card) {
                        return card;
                    }
                }
            }
        } else {
            for (const card of root.cards) {
                if (card.id === card_id) {
                    return card;
                } else {
                    const sub = this.findCard(card_id, card.attachments);
                    if (sub) {
                        return sub;
                    }
                }
            }
        }

        return null;
    }

    public getLocation(location_id: string): LocationState | null {
        for (const player of this.state.players) {
            for (const location of [ player.active, player.bench, player.deck, player.discard, player.hand, player.prizes ]) {
                if (location.id === location_id) {
                    return location;
                }
            }
            for (const card of [ ...player.active.cards, ...player.bench.cards ]) {
                if (card.attachments.id === location_id) {
                    return card.attachments;
                }
            }
        }
        return null;
    }

    public moveCard(card_id: string, from_id: string, to_id: string) {
        const card = this.findCard(card_id)!;
        const from = this.getLocation(from_id)!;
        const to = this.getLocation(to_id)!;
        from.cards.splice(from.cards.indexOf(card), 1);
        to.cards.push(card);
    }

    public beginTurn(player_id: string) {
        if (this.state.turn) {
            this.send("End of", this.activePlayer, "'s turn.");
            this.send();
        }
        this.state.turn = {
            number: (this.state.turn?.number ?? 0) + 1,
            player: player_id,
            energyPlayed: false
        };
        this.send("Beginning of", this.activePlayer, "'s turn.");
        this.draw(player_id);
    }

    public endTurn() {
        this.beginTurn(this.inactivePlayer.id);
    }
};

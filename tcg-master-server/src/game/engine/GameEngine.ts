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
import { Client_HumanSimulator } from "../../ai/Client_HumanSimulator.js";

export class GameEngine {
    private readonly clients: Client[];
    private state: GameState;

    private readonly setup: GameWorker_Setup;
    private readonly turns: GameWorker_Turn;

    public constructor(client1?: Client, client2?: Client, options: { prizes?: number } = {}, clonedState?: GameState) {
        this.setup = new GameWorker_Setup(this);
        this.turns = new GameWorker_Turn(this);

        if (client1) {
            client1.game = this;
        } else {
            client1 = new Client_AI();
            client1.game = this;
        }
        if (client2) {
            client2.game = this;
        } else {
            client2 = new Client_AI();
            client2.game = this;
        }
        this.clients = [ client1, client2 ];
        client1.player_id = client1.player_id ?? crypto.randomUUID();
        client2.player_id = client2.player_id ?? clonedState?.players.find(p => p.id !== client1.player_id)?.id ?? crypto.randomUUID();
        this.state = clonedState ?? {
            players: [
                {
                    id: client1.player_id,
                    token: { name: "Pikachu", type: "player" },
                    name: "Pikachu",
                    pronouns: { subjective: "they", possessive: "their" },
                    active: { id: crypto.randomUUID(), name: "Pikachu's active", cards: [] },
                    bench: { id: crypto.randomUUID(), name: "Pikachu's bench", cards: [] },
                    hand: { id: crypto.randomUUID(), name: "Pikachu's hand", cards: [] },
                    discard: { id: crypto.randomUUID(), name: "Pikachu's discard", cards: [] },
                    prizes: { id: crypto.randomUUID(), name: "Pikachu's prizes", cards: [] },
                    deck: { id: crypto.randomUUID(), name: "Pikachu's deck", cards: [] },
                    mulligans: 0,
                    mulliganBonusUsed: false,
                    setupComplete: false
                },
                {
                    id: client2.player_id,
                    token: { name: "COM", type: "player" },
                    name: "COM",
                    pronouns: { subjective: "they", possessive: "their" },
                    active: { id: crypto.randomUUID(), name: "COM's active", cards: [] },
                    bench: { id: crypto.randomUUID(), name: "COM's bench", cards: [] },
                    hand: { id: crypto.randomUUID(), name: "COM's hand", cards: [] },
                    discard: { id: crypto.randomUUID(), name: "COM's discard", cards: [] },
                    prizes: { id: crypto.randomUUID(), name: "COM's prizes", cards: [] },
                    deck: { id: crypto.randomUUID(), name: "COM's deck", cards: [] },
                    mulligans: 0,
                    mulliganBonusUsed: false,
                    setupComplete: false
                }
            ],
            turn: null,
            interrupt: null,
            interruptStack: [],
            rules: {
                prizes: options.prizes ?? 6
            }
        };
        if (!clonedState) {
            this.update();
        }
    }

    public getState(): GameState {
        return this.state;
    }

    public getClient(player_id: string): Client {
        return this.clients.find(c => c.player_id === player_id)!;
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

    public update(callback?: () => void) {
        if (!this.state.winner_id) {
            if (this.state.interrupt) {
                this.interrupt(this.state.interrupt, callback);
            } else if (this.state.interruptStack.length) {
                this.interrupt(this.state.interruptStack.pop()!, callback);
            } else if (!this.state.turn) {
                this.setup.update(callback);
            } else {
                this.turns.update(callback);
            }
        }
    }

    public interrupt(interrupt: Interrupt, callback?: () => void) {
        this.assignInterruptId(interrupt);
        this.state.interrupt = interrupt;
        this.sendInterrupt(interrupt, callback);
    }

    public stackInterrupt(interrupt: Interrupt) {
        if (this.state.interrupt) {
            this.state.interruptStack.push(this.state.interrupt);
        }
        this.interrupt(interrupt);
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

    private sendInterrupt(interrupt: Interrupt, callback?: () => void) {
        if (interrupt.interrupts?.length) {
            for (const sub of interrupt.interrupts) {
                this.sendInterrupt(sub, callback);
            }
        } else {
            this.clients.find(c => c.player_id === interrupt.player)!
                .prompt(interrupt.prompt!, interrupt.choices!, interrupt.force, callback);
        }
    }

    public send(...parts: any[]) {
        if (!this.state.winner_id) {
            for (const client of this.clients) {
                client.send(...parts);
            }
        }
    }

    public sendError(player: PlayerState, ...parts: (IToken | string)[]) {
        if (!this.state.winner_id) {
            this.clients.find(c => c.player_id === player.id)?.error(...parts);
        }
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

    public resolveInterrupt(player_id: string, choice: number | null, callback?: () => void) {
        const interrupt = this.getInterrupt(player_id);
        if (interrupt) {
            let resolved = true;
            if (choice !== null) {
                resolved = InterruptResolver.resolve(this, interrupt, choice);
            } else if (interrupt.cancelResolution) {
                InterruptResolver.cancel(this, interrupt, player_id);
            }
            if (resolved) {
                this.closeInterrupt(interrupt.id!);
            }
            this.getClient(player_id).wait();
            this.update(callback);
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

    public takePrize(player_id: string) {
        const player = this.getPlayer(player_id);
        player.hand.cards.push(player.prizes.cards.pop()!);
        this.send(player, "took a prize.");
        if (player.prizes.cards.length <= 0) {
            this.endGame(player_id);
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

    public get activePlayer(): PlayerState {
        return this.state.players.find(p => p.id === this.state.turn!.player)!;
    }

    public get inactivePlayer(): PlayerState {
        return this.state.players.find(p => p.id !== this.state.turn!.player)!;
    }

    public findCard(card_id: string, root?: LocationState): CardState | null {
        if (!root) {
            for (const player of this.state.players) {
                for (const location of [ player.active, player.bench, player.hand, player.discard, player.prizes, player.deck ]) {
                    const card = this.findCard(card_id, location);
                    if (card) {
                        return card;
                    }
                }
            }
        } else {
            for (const card of root.cards) {
                if (!card) {
                    console.log(root.name);
                }
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
            energyPlayed: false,
            attacked: false
        };
        this.send("Beginning of", this.activePlayer, "'s turn.");
        this.draw(player_id);
    }

    public endTurn() {
        for (const client of this.clients) {
            client.notify_endOfTurn();
        }
        this.beginTurn(this.inactivePlayer.id);
    }

    public endGame(winner_id: string) {
        const winner = this.getPlayer(winner_id);
        this.send(winner, "has no more prizes left.", winner, "wins!");
        this.state.winner_id = winner_id;
    }
};

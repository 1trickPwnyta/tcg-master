import { Client_AI } from "../../ai/Client_AI.js";
import { GameState } from "../state/GameState.js";
import { Interrupt } from "../state/Interrupt.js";
import { PlayerState } from "../state/PlayerState.js";
import { CardState } from "../state/CardState.js";
import { CardDatabase } from "../cards/CardDatabase.js";
import { CardWorker_Pokemon } from "../cards/workers/CardWorker_Pokemon.js";
import { Client } from "../../Client.js";
import { IToken } from "../../IToken.js";
import { GameWorker_Setup } from "./GameWorker_Setup.js";
import { GameWorker_Turn } from "./GameWorker_Turn.js";
import { LocationState } from "../state/LocationState.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { CardWorker_Energy } from "../cards/workers/CardWorker_Energy.js";

export class GameEngine {
    private readonly clients: Client[];
    private state: GameState;
    private simulation: boolean = false;
    private promptsGiven: number = 0;

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
        client1.player_id = client1.player_id ?? 1;
        client2.player_id = client2.player_id ?? clonedState?.players.find(p => p.id !== client1.player_id)?.id ?? 2;
        this.state = clonedState ?? {
            players: [
                {
                    id: client1.player_id,
                    token: { name: "Pikachu", type: "player" },
                    name: "Pikachu",
                    pronouns: { subjective: "they", possessive: "their" },
                    active: { id: 10, name: "Pikachu's active", cards: [] },
                    bench: { id: 11, name: "Pikachu's bench", cards: [] },
                    limbo: { id: 16, name: "Pikachu's limbo", cards: [] },
                    hand: { id: 12, name: "Pikachu's hand", cards: [] },
                    discard: { id: 13, name: "Pikachu's discard", cards: [] },
                    prizes: { id: 14, name: "Pikachu's prizes", cards: [] },
                    deck: { id: 15, name: "Pikachu's deck", cards: [] },
                    mulligans: 0,
                    mulliganBonusUsed: false,
                    setupComplete: false
                },
                {
                    id: client2.player_id,
                    token: { name: "COM", type: "player" },
                    name: "COM",
                    pronouns: { subjective: "they", possessive: "their" },
                    active: { id: 20, name: "COM's active", cards: [] },
                    bench: { id: 21, name: "COM's bench", cards: [] },
                    limbo: { id: 26, name: "COM's limbo", cards: [] },
                    hand: { id: 22, name: "COM's hand", cards: [] },
                    discard: { id: 23, name: "COM's discard", cards: [] },
                    prizes: { id: 24, name: "COM's prizes", cards: [] },
                    deck: { id: 25, name: "COM's deck", cards: [] },
                    mulligans: 0,
                    mulliganBonusUsed: false,
                    setupComplete: false
                }
            ],
            turn: null,
            betweenTurns: false,
            interrupt: null,
            interruptStack: [],
            rules: {
                prizes: options.prizes ?? 6
            },
            nextInterrupt_id: 1000
        };
        this.simulation = clonedState !== undefined;
        if (!this.simulation) {
            this.update();
        }
    }

    public getState(): GameState {
        return this.state;
    }

    public getStateHash(): number {
        const str = JSON.stringify([
            this.state.players.map(p => {
                p.active,
                [ ...p.bench.cards ].sort((a, b) => a.id - b.id),
                p.limbo,
                [ ...p.hand.cards ].sort((a, b) => a.id - b.id),
                p.discard,
                p.prizes,
                p.deck
            }),
            this.state.turn,
            this.state.winner_id,
            this.state.interrupt?.player,
            this.state.interrupt?.prompt,
            this.state.interrupt?.choices
        ]);
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 33) ^ str.charCodeAt(i);
        }
        return hash >>> 0;
    }

    public getClient(player_id: number): Client {
        return this.clients.find(c => c.player_id === player_id)!;
    }

    public getPlayer(player_id: number): PlayerState {
        return this.state.players.find(p => p.id === player_id)!;
    }

    public getOpponent(player_id: number): PlayerState {
        return this.state.players.find(p => p.id !== player_id)!;
    }

    public flipCoin(player_id?: number): boolean {
        const heads = Math.random() < 0.5;
        if (player_id) {
            this.send(this.getPlayer(player_id), "flipped a coin... It was", heads ? "heads" : "tails", "!");
        } else {
            this.send("A coin was flipped... It was", heads ? "heads" : "tails", "!");
        }
        return heads;
    }

    public update() {
        if (!this.state.winner_id) {
            if (this.state.interrupt) {
                this.interrupt(this.state.interrupt);
            } else if (this.state.interruptStack.length) {
                this.interrupt(this.state.interruptStack.pop()!);
            } else if (!this.state.turn) {
                this.setup.update();
            } else if (this.state.betweenTurns) {
                this.beginTurn(this.inactivePlayer.id);
            } else {
                this.turns.update();
            }
        }
    }

    public interrupt(interrupt: Interrupt) {
        this.assignInterruptId(interrupt);
        this.state.interrupt = interrupt;
        this.sendInterrupt(interrupt);
    }

    public stackInterrupt(interrupt: Interrupt) {
        if (this.state.interrupt) {
            this.state.interruptStack.push(this.state.interrupt);
        }
        this.interrupt(interrupt);
    }

    private assignInterruptId(interrupt: Interrupt) {
        if (!interrupt.id) {
            interrupt.id = this.state.nextInterrupt_id++;
        }
        if (interrupt.interrupts) {
            for (const sub of interrupt.interrupts) {
                this.assignInterruptId(sub);
            }
        }
    }

    private sendInterrupt(interrupt: Interrupt) {
        if (this.simulation && this.promptsGiven > 0) {
            return;
        }
        if (interrupt.interrupts?.length) {
            for (const sub of interrupt.interrupts) {
                this.sendInterrupt(sub);
            }
        } else {
            this.promptsGiven++;
            this.clients.find(c => c.player_id === interrupt.player)!
                .prompt(interrupt.prompt!, interrupt.choices!, interrupt.force);
        }
    }

    public send(...parts: any[]) {
        for (const player of this.state.players) {
            this.sendTo(player.id, ...parts);
        }
    }

    public sendTo(player_id: number, ...parts: any[]) {
        if (!this.state.winner_id) {
            const client = this.clients.find(c => c.player_id === player_id);
            client?.send(...parts);
        }
    }

    public sendError(player: PlayerState, ...parts: (IToken | string)[]) {
        if (!this.state.winner_id) {
            this.clients.find(c => c.player_id === player.id)?.error(...parts);
        }
    }

    public checkActivePokemon(): Interrupt | null {
        const playersWithNoActive = this.state.players.filter(p => !p.active.cards.length && p.bench.cards.length);
        if (playersWithNoActive.length) {
            return {
                interrupts: playersWithNoActive.map(p => ({
                    player: p.id,
                    prompt: "Select a Pokémon from your bench to be your active Pokémon.",
                    choices: p.bench.cards.map(c => ({ text: c.name, target_id: c.id })),
                    resolution: InterruptResolution.Promote,
                    force: true,
                    args: [ p.id ]
                }))
            };
        } else {
            return null;
        }
    }

    public shuffleDeck(player_id: number) {
        const player = this.getPlayer(player_id);
        for (let i = player.deck.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = player.deck.cards[i];
            player.deck.cards[i] = player.deck.cards[j];
            player.deck.cards[j] = temp;
        }
        this.send(player, "shuffled", player.pronouns.possessive, "deck.");
    }

    public shuffleHandIntoDeck(player_id: number) {
        const player = this.getPlayer(player_id);
        while (player.hand.cards.length) {
            player.deck.cards.push(player.hand.cards.pop()!);
        }
        this.shuffleDeck(player_id);
    }

    public draw(player_id: number, amount: number = 1) {
        const player = this.getPlayer(player_id);
        amount = Math.min(amount, player.deck.cards.length);
        const cardsDrawn = [];
        for (let i = 0; i < amount; i++) {
            const card = player.deck.cards.pop()!;
            player.hand.cards.push(card);
            cardsDrawn.push(card);
        }
        if (amount > 5) {
            this.send(player, "drew", amount, `card${amount > 1 ? "s" : ""}.`)
        } else {
            this.sendTo(this.getOpponent(player.id).id, player, "drew", amount, `card${amount > 1 ? "s" : ""}.`)
            this.sendTo(player.id, "You drew", ...Client.getCardList(cardsDrawn));
        }
    }

    public takePrize(player_id: number) {
        const player = this.getPlayer(player_id);
        const card = player.prizes.cards.pop()!;
        player.hand.cards.push(card);
        this.sendTo(this.getOpponent(player.id).id, player, "took a prize.");
        this.sendTo(player.id, "You took", card, "as a prize.");
        if (player.prizes.cards.length <= 0) {
            this.endGame(player_id);
        }
    }

    public basicPokemonInHand(player_id: number): CardState[] {
        const player = this.getPlayer(player_id);
        return player.hand.cards.filter(c => {
            const worker = CardDatabase.find(c.dbid)
            if (worker instanceof CardWorker_Pokemon) {
                return worker.stage === "basic";
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

    public getCard(card_id: number, root?: LocationState): CardState | null {
        if (!root) {
            for (const player of this.state.players) {
                for (const location of [ player.active, player.bench, player.limbo, player.hand, player.discard, player.prizes, player.deck ]) {
                    const card = this.getCard(card_id, location);
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
                    const sub = this.getCard(card_id, card.attachments);
                    if (sub) {
                        return sub;
                    }
                }
            }
        }

        return null;
    }

    public findCard(card_id: number, root?: LocationState): LocationState | null {
        if (!root) {
            for (const player of this.state.players) {
                for (const location of [ player.active, player.bench, player.limbo, player.hand, player.discard, player.prizes, player.deck ]) {
                    const sub = this.findCard(card_id, location);
                    if (sub) {
                        return sub;
                    }
                }
            }
        } else {
            for (const card of root.cards) {
                if (card.id === card_id) {
                    return root;
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

    public getLocation(location_id: number): LocationState | null {
        for (const player of this.state.players) {
            for (const location of [ player.active, player.bench, player.limbo, player.deck, player.discard, player.hand, player.prizes ]) {
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

    public moveCard(card_id: number, from_id: number, to_id: number) {
        const card = this.getCard(card_id)!;
        const owner = this.getPlayer(card.owner_id)!;
        const from = this.getLocation(from_id)!;
        const to = this.getLocation(to_id)!;
        if (owner.active.id !== to_id) {
            card.orientation = "normal";
            card.poison = false;
        }
        if (owner.active.id !== to_id && owner.bench.id !== to_id) {
            card.damage = 0;
            for (const attachment of card.attachments.cards) {
                this.moveCard(attachment.id, card.attachments.id, owner.discard.id);
            }
        }
        from.cards.splice(from.cards.indexOf(card), 1);
        to.cards.push(card);
    }

    public getEnergy(card_id: number): { card: CardState, worker: CardWorker_Energy }[] {
        return this.getCard(card_id)!.attachments.cards.filter(c => c.kind === "energy").map(c => ({
            card: c,
            worker: CardDatabase.find<CardWorker_Energy>(c.dbid)
        }));
    }

    public damagePokemon(player_id: number, card_id: number, amount: number, source?: string): boolean {
        if (amount) {
            const player = this.getPlayer(player_id)!;
            const card = this.getCard(card_id)!;
            card.damage += amount;
            this.send(player, "'s", card, "took", { name: amount.toString(), type: "damage" }, `damage${source ? ` due to ${source}` : ""}!`);
            if (card.damage >= CardDatabase.find<CardWorker_Pokemon>(card.dbid).hp) {
                this.send(player, "'s", card, "was knocked out!");
                this.moveCard(card.id, this.findCard(card.id)!.id, player.discard.id);
                this.takePrize(this.getOpponent(player.id).id);
                const interrupt = this.checkActivePokemon();
                if (interrupt) {
                    this.interrupt(interrupt);
                }
                return true;
            }
        }

        return false;
    }

    public healPokemon(player_id: number, card_id: number, amount: number) {
        const player = this.getPlayer(player_id)!;
        const card = this.getCard(card_id)!;
        amount = Math.min(amount, card.damage);
        card.damage -= amount;
        this.send(player, "'s", card, "was healed for ", { name: amount.toString(), type: "heal" }, "HP.");
    }

    public poisonPokemon(player_id: number, card_id: number) {
        const player = this.getPlayer(player_id)!;
        const card = this.getCard(card_id)!;
        card.poison = true;
        this.send(player, "'s", card, "was poisoned!");
    }

    public confusePokemon(player_id: number, card_id: number) {
        const player = this.getPlayer(player_id)!;
        const card = this.getCard(card_id)!;
        card.orientation = "confused";
        this.send(player, "'s", card, "got confused!");
    }

    public paralyzePokemon(player_id: number, card_id: number) {
        const player = this.getPlayer(player_id)!;
        const card = this.getCard(card_id)!;
        card.orientation = "paralyzed";
        this.send(player, "'s", card, "was paralyzed!");
    }

    public beginTurn(player_id: number) {
        this.state.turn = {
            number: (this.state.turn?.number ?? 0) + 1,
            player: player_id,
            energyPlayed: false,
            attacked: false
        };
        this.state.betweenTurns = false;
        this.send();
        this.send("Beginning of", this.activePlayer, "'s turn.");
        this.draw(player_id);
        this.update();
    }

    public endTurn() {
        this.send("End of", this.activePlayer, "'s turn.");
        this.send();
        for (const player of this.state.players) {
            const active = player.active.cards[0];
            if (active?.poison) {
                this.damagePokemon(player.id, active.id, 10, "poison");
            }
            if (active?.orientation === "paralyzed" && this.state.turn?.player === player.id) {
                active.orientation = "normal";
                this.send(player, "'s", active, "was cured of paralysis!");
            }
            if (this.state.turn?.player !== player.id) {
                active.damagePrevention = undefined;
            }
        }
        for (const client of this.clients) {
            client.notify_endOfTurn();
        }
        this.state.betweenTurns = true;
    }

    public endGame(winner_id: number) {
        this.state.interrupt = null;
        const winner = this.getPlayer(winner_id);
        this.send(winner, "has no more prizes left.", winner, "wins!");
        this.state.winner_id = winner_id;
        for (const client of this.clients) {
            client.notify_gameOver(winner);
        }
    }
};

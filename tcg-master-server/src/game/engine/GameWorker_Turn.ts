import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { Turn } from "../state/Turn.js";
import { GameWorker } from "./GameWorker.js";

export class GameWorker_Turn extends GameWorker {
    private get turn(): Turn {
        return this.state.turn!;
    }

    public begin(player_id: number) {
        this.state.turn = {
            number: (this.state.turn?.number ?? 0) + 1,
            player: player_id,
            energyPlayed: false,
            attacked: false
        };
        this.state.betweenTurns = false;
        this.game.send();
        this.game.send("Beginning of", this.game.players.active, "'s turn.");
        this.game.cards.draw(player_id);
        this.game.update();
    }

    public end() {
        this.game.send("End of", this.game.players.active, "'s turn.");
        this.game.send();
        for (const player of this.state.players) {
            const active = player.active.cards[0];
            if (active?.poison) {
                this.game.pokemon.damage({ owner_id: player.id, card_id: active.id, amount: 10, source: "poison" });
            }
            if (this.state.turn?.player === player.id) {
                if (active?.orientation === "paralyzed") {
                    active.orientation = "normal";
                    this.game.send(player, "'s", active, "was cured of paralysis!");
                }
                active.accuracyChecks = undefined;
            } else {
                active.damagePrevention = undefined;
            }
        }
        for (const client of this.game.clients) {
            client.notify_endOfTurn();
        }
        this.state.betweenTurns = true;
    }

    public update() {
        const playerWithNoPokemon = this.state.players.find(p => !p.active.cards.length && !p.bench.cards.length);
        if (playerWithNoPokemon) {
            this.game.end(this.state.players.find(p => p.id !== playerWithNoPokemon.id)!.id);
            return;
        }

        const interrupt = this.checkActivePokemon();
        if (interrupt) {
            this.game.interrupts.interrupt(interrupt);
            return;
        }

        if (!this.turn.attacked) {
            this.game.interrupts.interrupt({
                player: this.turn.player,
                prompt: "Your turn.",
                choices: [
                    {
                        text: "play a card",
                        resolution: InterruptResolution.PlayCard
                    },
                    {
                        text: "attack",
                        resolution: InterruptResolution.Attack
                    },
                    {
                        text: "retreat",
                        resolution: InterruptResolution.Retreat
                    },
                    {
                        text: "end turn",
                        resolution: InterruptResolution.EndTurn
                    }
                ],
                force: true
            });
        } else {
            this.end();
            this.game.update();
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
};

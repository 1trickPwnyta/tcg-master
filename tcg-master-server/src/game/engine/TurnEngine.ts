import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { Turn } from "../state/Turn.js";
import { SubEngine } from "./SubEngine.js";
import { CardStatus } from "../state/CardState.js";
import { DefDatabase } from "../../defs/DefDatabase.js";
import { StatusDef } from "../../defs/StatusDef.js";

export class TurnEngine extends SubEngine {
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
        this.engine.send();
        this.engine.send("Beginning of", this.engine.players.active, "'s turn.");
        this.engine.cards.draw(player_id);
        this.engine.update();
    }

    public end() {
        this.engine.send("End of", this.engine.players.active, "'s turn.");
        this.engine.send();
        for (const player of this.state.players) {
            const active = player.active.cards[0];
            if (this.state.turn?.player === player.id) {
                active.accuracyChecks = undefined;
            } else {
                active.damagePrevention = undefined;
                active.damageThreshold = undefined;
            }

            for (const status of active.status) {
                const def = DefDatabase.get<StatusDef>(status);
                def.worker.notify_endOfTurn({
                    engine: this.engine,
                    owner_id: player.id,
                    card_id: active.id
                }, this.state.turn!.player);
            }
        }
        for (const client of this.engine.clients) {
            client.notify_endOfTurn();
        }
        this.state.betweenTurns = true;
    }

    public update() {
        const playerWithNoPokemon = this.state.players.find(p => !p.active.cards.length && !p.bench.cards.length);
        if (playerWithNoPokemon) {
            this.engine.end(this.state.players.find(p => p.id !== playerWithNoPokemon.id)!.id);
            return;
        }

        const interrupt = this.checkActivePokemon();
        if (interrupt) {
            this.engine.interrupts.interrupt(interrupt);
            return;
        }

        if (!this.turn.attacked) {
            this.engine.interrupts.interrupt({
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
            this.engine.update();
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

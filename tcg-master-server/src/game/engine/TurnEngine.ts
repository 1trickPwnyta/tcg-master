import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { Turn } from "../state/Turn.js";
import { SubEngine } from "./SubEngine.js";
import { Choice } from "../state/Choice.js";

export class TurnEngine extends SubEngine {
    private get turn(): Turn {
        return this.state.turn!;
    }

    public begin(player_id: number) {
        const player = this.engine.game.getPlayer(player_id);
        this.state.turn = {
            number: (this.state.turn?.number ?? 0) + 1,
            player: player.id,
            energyPlayed: false,
            attacked: false
        };
        this.state.betweenTurns = false;
        this.engine.send();
        this.engine.send("Beginning of", this.engine.game.activePlayer, "'s turn.");
        player.draw();
        this.engine.game.update();
    }

    public end() {
        this.engine.send("End of", this.engine.game.activePlayer, "'s turn.");
        this.engine.send();
        for (const player of this.state.players) {
            const active = player.activePokemon!;
            for (const status of active.status) {
                status.def.worker.notify_endOfTurn({
                    engine: this.engine,
                    owner: player,
                    card: active
                }, this.state.turn!.player);
            }
        }
        for (const client of this.engine.clients) {
            client.notify_endOfTurn();
        }
        this.state.betweenTurns = true;
    }

    public update() {
        const playerWithNoPokemon = this.state.players.find(p => !p.activePokemon && !p.bench.count);
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
                    new Choice({ text: "play a card" }, InterruptResolution.PlayCard),
                    new Choice({ text: "attack" }, InterruptResolution.Attack),
                    new Choice({ text: "retreat" }, InterruptResolution.Retreat),
                    new Choice({ text: "end turn" }, InterruptResolution.EndTurn)
                ],
                force: true
            });
        } else {
            this.end();
            this.engine.game.update();
        }
    }

    public checkActivePokemon(): Interrupt | null {
        const playersWithNoActive = this.state.players.filter(p => !p.activePokemon && p.bench.count);
        if (playersWithNoActive.length) {
            return {
                interrupts: playersWithNoActive.map(p => ({
                    player: p.id,
                    prompt: "Select a Pokémon from your bench to be your active Pokémon.",
                    choices: p.bench.cards.map(c => new Choice(c)),
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

import { InterruptResolution } from "../InterruptResolution.js";
import { Turn } from "../state/Turn.js";
import { GameWorker } from "./GameWorker.js";

export class GameWorker_Turn extends GameWorker {
    private get turn(): Turn {
        return this.state.turn!;
    }

    public update() {
        const playerWithNoPokemon = this.state.players.find(p => !p.active.cards.length && !p.bench.cards.length);
        if (playerWithNoPokemon) {
            this.game.endGame(this.state.players.find(p => p.id !== playerWithNoPokemon.id)!.id);
            return;
        }

        const interrupt = this.game.checkActivePokemon();
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
            this.game.endTurn();
            this.game.update();
        }
    }
};

import { InterruptResolution } from "../InterruptResolution.js";
import { Turn } from "../state/Turn.js";
import { GameWorker } from "./GameWorker.js";

export class GameWorker_Turn extends GameWorker {
    private get turn(): Turn {
        return this.state.turn!;
    }

    public update(callback?: () => void) {
        const playerWithNoPokemon = this.state.players.find(p => !p.active.cards.length && !p.bench.cards.length);
        if (playerWithNoPokemon) {
            this.game.endGame(this.state.players.find(p => p.id !== playerWithNoPokemon.id)!.id);
            return;
        }

        const playersWithNoActive = this.state.players.filter(p => !p.active.cards.length && p.bench.cards.length);
        if (playersWithNoActive.length) {
            this.game.interrupt({
                interrupts: playersWithNoActive.map(p => ({
                    player: p.id,
                    prompt: "Select a Pokémon from your bench to be your active Pokémon.",
                    choices: p.bench.cards.map(c => ({ text: c.name, target_id: c.id })),
                    resolution: InterruptResolution.Promote,
                    force: true,
                    args: [ p.id ]
                }))
            }, callback);
            return;
        }

        if (!this.turn.attacked) {
            this.game.interrupt({
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
            }, callback);
        } else {
            this.game.endTurn();
            this.game.update(callback);
        }
    }
};

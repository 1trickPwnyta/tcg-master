import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { CardState } from "../state/CardState.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PlayerState } from "../state/PlayerState.js";
import { SubEngine } from "./SubEngine.js";
import { InterruptType } from "../state/interrupts/InterruptType.js";
import { DefDatabase } from "../../defs/DefDatabase.js";
import { PokemonCardDef } from "../../defs/PokemonCardDef.js";
import { EnergyCardDef } from "../../defs/EnergyCardDef.js";
import { CardDef } from "../../defs/CardDef.js";
import { TrainerCardDef } from "../../defs/TrainerCardDef.js";

export class SetupEngine extends SubEngine {
    private nextCardId: number = 100;

    public update() {
        if (this.state.players.find(p => p.deck.cards.length === 0)) {
            this.engine.send("Starting game between", this.state.players[0], "and", this.state.players[1], ".");
            for (const player of this.state.players) {
                const deck = [
                    //{ card: CardDatabase.find("BaseSet.Ponyta"), count: 8 },
                    { card: DefDatabase.get<PokemonCardDef>("BaseSet.Koffing"), count: 24 },
                    { card: DefDatabase.get<EnergyCardDef>("BaseSet.PsychicEnergy"), count: 0 },
                    { card: DefDatabase.get<TrainerCardDef>("BaseSet.Switch"), count: 10 },
                    { card: DefDatabase.get<EnergyCardDef>("BaseSet.GrassEnergy"), count: 26 },
                    //{ card: DefDatabase.get<PokemonCardDef>("BaseSet.Gastly"), count: 12 }
                ];
                for (const blueprint of deck) {
                    for (let i = 0; i < blueprint.count; i++) {
                        const card = this.makeCard(blueprint.card!, player);
                        player.deck.cards.push(card);
                    }
                }
                this.engine.cards.shuffleDeck(player.id);
                player.mulligans = this.setupDraw(player);
            }
            this.engine.update();
        } else if (this.state.players.find(p => p.mulligans && !this.state.players.find(o => o.id !== p.id)!.mulliganBonusUsed)) {
            this.engine.interrupts.interrupt({
                interrupts: this.state.players.map((p): Interrupt | undefined => {
                    const opponent = this.state.players.find(o => o.id !== p.id)!;
                    if (opponent.mulligans) {
                        return {
                            player: p.id,
                            prompt: "Will you draw additional cards?",
                            choices: Array.from({ length: opponent.mulligans }, (_, i) => ({ text: (i + 1).toString(), target_id: i + 1 })),
                            resolution: InterruptResolution.UseMulliganBonus,
                            cancelResolution: InterruptResolution.SkipMulliganBonus,
                            args: [ p.id ]
                        };
                    } else {
                        return undefined;
                    }
                }).filter(i => i !== undefined)
            });
        } else if (this.state.players.find(p => !p.active.cards.length)) {
            this.engine.interrupts.interrupt({
                interrupts: this.state.players.map(p => ({
                    type: InterruptType.SelectActive,
                    player: p.id,
                    prompt: "Select a basic Pokémon as your active Pokémon.",
                    choices: this.engine.cards.basicPokemonInHand(p.id).map(c => ({ text: c.name, target_id: c.id })),
                    resolution: InterruptResolution.MoveCard,
                    args: [ p.hand.id, p.active.id ],
                    force: true
                }))
            });
        } else {
            const playersNotReady = this.state.players.filter(p => !p.setupComplete && this.engine.cards.basicPokemonInHand(p.id).length && p.bench.cards.length < 5);
            if (playersNotReady.length) {
                this.engine.interrupts.interrupt({
                    interrupts: playersNotReady.map(p => ({
                        type: InterruptType.Bench,
                        player: p.id,
                        prompt: "Choose other basic Pokémon to put on the bench.",
                        choices: this.engine.cards.basicPokemonInHand(p.id).map(c => ({ text: c.name, target_id: c.id })),
                        resolution: InterruptResolution.MoveCard,
                        cancelResolution: InterruptResolution.SkipBench,
                        args: [ p.hand.id, p.bench.id ]
                    }))
                });
            } else {
                for (const player of this.state.players) {
                    for (let i = 0; i < this.state.rules.prizes; i++) {
                        player.prizes.cards.push(player.deck.cards.pop()!);
                    }
                }
                const firstPlayer = this.engine.flipCoin() ? this.state.players[0] : this.state.players[1];
                this.engine.send(firstPlayer, "will go first.");
                this.engine.send();
                this.engine.turns.begin(firstPlayer.id);
            }
        }
    }

    private setupDraw(player: PlayerState, mulligans: number = 0): number {
        this.engine.cards.draw(player.id, 7);
        if (this.engine.cards.basicPokemonInHand(player.id).length) {
            return mulligans;
        } else {
            this.engine.send(player, "has no basic Pokémon in", player.pronouns.possessive, "hand.", player.pronouns.subjective.capitalizeFirst(), "must take a mulligan.");
            this.engine.cards.shuffleHandIntoDeck(player.id);
            return this.setupDraw(player, mulligans + 1);
        }
    }

    private makeCard(def: CardDef, owner: PlayerState): CardState {
        return {
            id: this.nextCardId++,
            def: def.name,
            kind: def.kind,
            token: def.token,
            name: def.label ?? def.name,
            owner_id: owner.id,
            damage: 0,
            orientation: "normal",
            attachments: { id: this.nextCardId++, cards: [] },
            status: []
        };
    }
};

import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { GameEngine } from "../engine/GameEngine.js";
import { Card } from "./Card.js";
import { EnergyCard } from "./EnergyCard.js";
import { Location } from "./Location.js";
import { Player } from "./Player.js";
import { PokemonCard } from "./PokemonCard.js";
import { Serializable, Serialize } from "./serializer.js";

export type ResolvedEnergyCard = {
    card: Card;
    amount: number;
    type: EnergyTypeDef;
};

@Serializable()
export class Attachments extends Location {
    @Serialize()
    private readonly pokemon_id: number;

    @Serialize()
    private readonly args: { card: number, args: { modifier: string, args: any }[] }[] = [];

    public get pokemon(): PokemonCard {
        return this.engine.search.getCard(this.pokemon_id) as PokemonCard;
    }

    public get energy(): EnergyTypeDef[] {
        return this.energyCards.flatMap(e => Array.from({ length: e.amount }, () => e.type));
    }

    public get energyCards(): ResolvedEnergyCard[] {
        let energyArray: ResolvedEnergyCard[] = [];
        for (const energy of this.cards.filter(c => c instanceof EnergyCard)) {
            energyArray.push({ card: energy, amount: energy.def.amount, type: energy.def.type });
        }
        for (const card of this.cards) {
            const args = this.args.find(a => a.card === card.id);
            if (args) {
                const cardEnergy = [];
                for (const modifier of card.def.modifiers.filter(m => m.isEnergy)) {
                    const energyArgs = args.args.find(a => a.modifier === modifier.argsKey);
                    if (energyArgs) {
                        const energyProduced = modifier.provideEnergy({
                            engine: this.engine,
                            owner: this.owner,
                            card: this.pokemon
                        }, energyArgs.args);
                        cardEnergy.push(...energyProduced);
                    }
                }
                if (cardEnergy.length) {
                    energyArray.push({ card: card, amount: cardEnergy.length, type: cardEnergy[0] });
                }
            }
        }

        return energyArray;
    }

    public get energyString(): string {
        const energy = this.energy;
        if (energy.length) {
            return `[${energy.map(e => e.symbol).join("")}]`;
        } else {
            return "";
        }
    }

    public constructor(id: number, engine: GameEngine, owner: Player, pokemon: PokemonCard) {
        super(id, engine, owner);
        this.pokemon_id = pokemon.id;
    }

    public override add(card: Card, args?: { modifier: string, args: any }[] ) {
        super.add(card);
        if (args) {
            this.args.push({ card: card.id, args: args });
        }
    }

    public override notify_removed(card: Card): void {
        const arg = this.args.find(a => a.card === card.id);
        if (arg) {
            this.args.splice(this.args.indexOf(arg), 1);
        }
    }

    public getArgs(card: number): any {
        return this.args.find(a => a.card === card);
    }
};

import { Prompt_SelectCard } from "../interaction/prompts/Prompt_SelectCard.js";
import { Card } from "./Card.js";
import { ITargeter } from "./ITargeter.js";

export class TargetSelector<T extends Card> {
    private parent: ITargeter<T>;

    public constructor(parent: ITargeter<T>) {
        this.parent = parent;
    }

    public selectTarget() {
        this.parent.player.setPrompt(new Prompt_SelectCard<T>(
            this.parent.prompt,
            this.parent.choices,
            (card: T) => {
                this.parent.execute(card);
                return true;
            },
            {
                cancelAction: () => this.parent.cancel()
            }
        ));
    }
};

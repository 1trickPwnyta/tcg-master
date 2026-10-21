import { Prompt } from "./Prompt.js";

export class Prompt_YesOrNo extends Prompt {
    public constructor(text: string, action: (yes: boolean) => boolean) {
        super(text, [
            {
                text: "yes",
                action: () => action(true)
            },
            {
                text: "no",
                action: () => action(false)
            }
        ]);
    }
};

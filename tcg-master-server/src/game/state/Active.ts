import { Location } from "./Location.js";
import { Serializable, Serialize } from "./serializer.js";

@Serializable()
export class Active extends Location {
    @Serialize()
    public override readonly inPlay: boolean = true;
};

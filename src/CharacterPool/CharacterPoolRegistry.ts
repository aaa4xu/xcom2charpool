import { TypedArray } from '../Core/Arrays/TypedArray';
import { StructProperty } from '../Core/Properties/StructProperty';
import { Registry } from '../Core/Registry';

/**
 * Registry preconfigured with XCOM 2 character pool array types.
 * Provides array factories for known charpool array names.
 */
export class CharacterPoolRegistry extends Registry {
    public constructor() {
        super();
        this.registerArray('CharacterPoolDataElements', TypedArray.of(StructProperty));
        this.registerArray('CharacterPool', TypedArray.of(StructProperty));
    }
}

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
        this.registerArray('CharacterPool', TypedArray.of(StructProperty));
        this.registerArray('ExtraDatas', TypedArray.of(StructProperty));
        this.registerArray('AppearanceStore', TypedArray.of(StructProperty));
        this.registerArray('CharacterPoolLoadout', TypedArray.of(StructProperty));
        this.registerArray('UniformSettings', TypedArray.of(StructProperty));
        this.registerArray('CosmeticOptions', TypedArray.of(StructProperty));
        this.registerArray('CharacterPoolDataElements', TypedArray.of(StructProperty));
    }
}

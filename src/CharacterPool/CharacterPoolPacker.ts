import { ArrayProperty } from '../Core/Properties/ArrayProperty';
import { NoneProperty } from '../Core/Properties/NoneProperty';
import { TypedArray } from '../Core/Arrays/TypedArray';
import { Packer as CorePacker } from '../Core/Packer';
import { CharacterPoolRegistry } from './CharacterPoolRegistry';
import type { Writer } from '../Core/Writer';

/**
 * File-level packer for XCOM 2 character pool binaries.
 * Writes the magic, property state, and trailing CharacterPoolDataElements array.
 */
export class CharacterPoolPacker extends CorePacker {
    public constructor(writer: Writer, registry = new CharacterPoolRegistry()) {
        super(writer, registry);
    }

    public writeFile(data: { state: Record<string, any>; data: TypedArray<unknown> | readonly unknown[] }) {
        // Write the magic number
        this.writer.uint32(0xffffffff);

        // Write the properties
        this.writeProperties(data.state);

        // Write the 'None' property to signify the end of properties
        NoneProperty.to(this.writer);

        // Write the trailing array
        const items = data.data instanceof TypedArray ? data.data.items : data.data;
        if (!Array.isArray(items)) {
            throw new Error('Trailing array must be an array');
        }
        ArrayProperty.to(this.writer, items, this);
    }
}

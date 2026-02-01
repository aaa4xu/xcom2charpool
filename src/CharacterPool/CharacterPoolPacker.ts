import { ArrayProperty } from '../Core/Properties/ArrayProperty';
import { NoneProperty } from '../Core/Properties/NoneProperty';
import { TypedArray } from '../Core/Arrays/TypedArray';
import { Packer as CorePacker } from '../Core/Packer';

export class CharacterPoolPacker extends CorePacker {
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

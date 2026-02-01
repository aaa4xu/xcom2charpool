import type { Reader } from '../Reader';
import type { Writer } from '../Writer';
import type { Packer } from '../Packer';
import { NoneProperty } from './NoneProperty';

/**
 * UE4 StructProperty that wraps a nested property bag with a struct type name.
 * Used for complex nested records and array elements in the charpool format.
 */
export class StructProperty {
    public static readonly type = 'StructProperty';

    public constructor(
        public readonly type: string,
        public readonly value: Record<string, any>,
    ) {}

    public static from(reader: Reader, name: string, size: number, factory: (reader: Reader) => any): StructProperty {
        let type: string;

        // size равен нулю, если парсинг происходит внутри массива таких объектов
        if (size > 0) {
            type = reader.string();
            reader.padding();
        } else {
            type = name;
        }

        const des = factory(reader);
        const value = des.properties();
        return new this(type, value);
    }

    public static to(target: Writer, value: StructProperty, packer: Packer, isArrayElement = false) {
        if (!isArrayElement) {
            target.string(value.type).padding();
        }
        // Record the start position for size calculation
        const startPosition = target.position;
        packer.writeProperties(value.value);
        NoneProperty.to(target);
        // Record the end position
        const endPosition = target.position;

        // Return the size for the size field
        return endPosition - startPosition;
    }
}

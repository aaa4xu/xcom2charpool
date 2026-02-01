import type { Reader } from '../Reader';
import type { Writer } from '../Writer';
import type { Packer } from '../Packer';
import { StructProperty } from './StructProperty';

/**
 * UE4 ArrayProperty that stores length and exposes a reader for the element payload.
 * Unpacker uses this to parse array elements, while Packer serializes arrays back out.
 */
export class ArrayProperty {
    public static readonly type = 'ArrayProperty';

    public constructor(
        public readonly length: number,
        public readonly reader: Reader,
    ) {}

    public static from(reader: Reader, name: string, size: number) {
        if (size < 4) {
            throw new Error('ArrayProperty size is too small');
        }

        if (reader.position + size > reader.length) {
            throw new Error('ArrayProperty size exceeds remaining bytes');
        }

        const length = reader.int32();
        if (length < 0) {
            throw new Error('ArrayProperty length is negative');
        }
        return new this(length, reader.subarray(size - 4));
    }

    public static to<T>(target: Writer, value: readonly T[] | ArrayProperty, packer: Packer) {
        if (value instanceof ArrayProperty) {
            target.int32(value.length);
            const remaining = value.reader.length - value.reader.position;
            if (remaining > 0) {
                target.bytes(value.reader.bytes(remaining));
            }
            return;
        }

        // Write the length of the array
        target.int32(value.length);

        // If the array is empty, nothing more to write
        if (value.length === 0) {
            return;
        }

        // UE4 may store arrays of empty structs as length-only (size=4). Detect that from data.
        if (this.isLengthOnlyStructArray(value)) {
            return;
        }

        for (let i = 0; i < value.length; i++) {
            packer.writeProperty('', value[i], true);
        }
    }

    private static isLengthOnlyStructArray(value: readonly unknown[]): boolean {
        if (value.length === 0) return false;
        for (const item of value) {
            if (!(item instanceof StructProperty)) return false;
            if (!item.value || Object.keys(item.value).length > 0) return false;
        }
        return true;
    }
}

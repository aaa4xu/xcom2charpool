import type { Reader } from '../Reader';
import type { Writer } from '../Writer';
import { Packer } from '../Packer';

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

    public static to<T>(target: Writer, value: readonly T[], packer: Packer) {
        // Write the length of the array
        target.int32(value.length);

        // If the array is empty, nothing more to write
        if (value.length === 0) {
            return;
        }

        for (let i = 0; i < value.length; i++) {
            packer.writeProperty('', value[i], true);
        }
    }
}

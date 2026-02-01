import type { Reader } from '../Reader';
import type { Writer } from '../Writer';

/**
 * UE4 IntProperty for 32-bit signed integers.
 * Used for numeric fields in the charpool property graph.
 */
export class IntProperty {
    public static readonly type = 'IntProperty';

    public static from(reader: Reader, name: string, size: number) {
        return reader.int32();
    }

    public static to(target: Writer, value: number) {
        target.int32(value);
    }
}

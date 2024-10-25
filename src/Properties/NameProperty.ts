import type { Reader } from '../Reader';
import type { Writer } from '../Writer';

/**
 * Represented as a String followed by a UInt32 that is
 * usually (but not always) 0. As the function of this UInt32 is unknown for
 * the moment, we just represent the value of if as plain number
 *
 * Неизвестное значение как-то связано с вариантами (версиями?) предметов
 */
export class NameProperty {
    public constructor(
        public readonly value: string,
        public readonly unk: number,
    ) {}

    public static from(reader: Reader, name: string, size: number) {
        const value = reader.string();
        const unk = reader.uint32();
        return new this(value, unk);
    }

    public static to(target: Writer, value: NameProperty) {
        // Write the string value
        target.string(value.value);

        // Write the uint32 'unk' value
        target.uint32(value.unk);
    }
}

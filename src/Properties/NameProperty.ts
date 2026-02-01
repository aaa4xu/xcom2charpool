import type { Reader } from '../Reader';
import type { Writer } from '../Writer';

/**
 * Public name, available to the world.
 * Names are stored as a combination of an index into a table of unique strings and an instance number.
 * Names are case-insensitive, but case-preserving.
 * Instance stored internally as 1 more than actual, so zero'd memory will be the default, no-instance case.
 */
export class NameProperty {
    public constructor(
        public readonly value: string,
        public readonly instanceId: number,
    ) {}

    /**
     * @deprecated
     * @see instanceId
     */
    public get unk() {
        return this.instanceId;
    }

    public toString() {
        if(this.instanceId > 0) {
            return `${this.value}_${this.instanceId - 1}`;
        } else {
            return this.value;
        }
    }

    public static from(reader: Reader, name: string, size: number) {
        const value = reader.string();
        const instanceId = reader.uint32();
        return new this(value, instanceId);
    }

    public static to(target: Writer, value: NameProperty) {
        if(value.instanceId < 0) {
            throw new Error('NameProperty instanceId cannot be negative');
        }

        // Write the string value
        target.string(value.value);

        // Write the uint32 'instanceId' value
        target.uint32(value.instanceId);
    }
}

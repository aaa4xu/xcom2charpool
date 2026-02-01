import type { Reader } from '../Reader';
import type { Writer } from '../Writer';

/**
 * UE4 NameProperty (FName) representation: string + instanceId.
 * Used by the packer/unpacker to preserve case-sensitive names and instance suffixes.
 * Instance is stored as 1 more than the actual value so zero means "no instance".
 */
export class NameProperty {
    public static readonly type = 'NameProperty';

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

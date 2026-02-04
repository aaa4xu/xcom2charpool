import { TypeCodec } from '../../TypeCodec';
import { NamePropertyValue } from './NamePropertyValue';
import { Reader } from '../../Reader';
import { Writer } from '../../Writer';
import { BaseCodec } from '../../BaseCodec';
import { CodecContext } from '../../CodecContext';

/**
 * Codec for UE NameProperty values, backed by NamePropertyValue.
 */
export class NameProperty extends BaseCodec implements TypeCodec<NamePropertyValue> {
    public readonly type = 'NameProperty';

    public read(reader: Reader, length: number, ctx: CodecContext): NamePropertyValue {
        return this.readSized(reader, length, ctx, (p) => {
            const value = p.string();
            const instanceId = p.uint32();
            return new NamePropertyValue(value, instanceId);
        });
    }

    public write(writer: Writer, value: NamePropertyValue): void {
        writer.string(value.value).uint32(value.instanceId);
    }

    public isSupported(value: unknown): value is NamePropertyValue {
        return value instanceof NamePropertyValue;
    }
}

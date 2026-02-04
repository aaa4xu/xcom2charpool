import { TypeCodec } from '../../TypeCodec';
import { Reader } from '../../Reader';
import { CodecContext } from '../../CodecContext';
import { Writer } from '../../Writer';
import { ObjectProperty } from '../ObjectProperty';
import { StructPropertyValue } from './StructPropertyValue';
import { BaseCodec } from '../../BaseCodec';

export class StructProperty extends BaseCodec implements TypeCodec<StructPropertyValue> {
    public readonly type = 'StructProperty';
    #codec = new ObjectProperty();

    public read(reader: Reader, length: number, ctx: CodecContext): StructPropertyValue {
        const type = reader.string();
        reader.padding();

        return this.readSized(reader, length, ctx, (payload) => {
            const obj = this.#codec.read(payload, length, ctx);
            return new StructPropertyValue(type, obj);
        });
    }

    public write(writer: Writer, value: StructPropertyValue, ctx: CodecContext): void | number {
        writer.string(value.type).padding();
        const startPosition = writer.position;
        this.#codec.write(writer, value.value, ctx);
        return writer.position - startPosition;
    }

    public isSupported(value: unknown): value is StructPropertyValue {
        return value instanceof StructPropertyValue;
    }
}

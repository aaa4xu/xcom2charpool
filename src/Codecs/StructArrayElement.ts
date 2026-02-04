import { ArrayElementCodec } from '../ArrayElementCodec';
import { StructPropertyValue } from '../Values/StructPropertyValue';
import { Reader } from '../Reader';
import { CodecContext } from '../CodecContext';
import { Writer } from '../Writer';
import { ObjectProperty } from './ObjectProperty';
import { CodecError } from '../Errors/CodecError';
import { BaseCodec } from '../BaseCodec';

export class StructArrayElement extends BaseCodec implements ArrayElementCodec<StructPropertyValue> {
    #codec = new ObjectProperty();

    public constructor(public readonly type: string) {
        super();
    }

    public read(reader: Reader, ctx: CodecContext): StructPropertyValue {
        const obj = this.#codec.read(reader, 0, ctx);
        return new StructPropertyValue(this.type, obj);
    }

    public write(writer: Writer, value: StructPropertyValue, ctx: CodecContext): void {
        if (value.type !== this.type) {
            throw new CodecError(
                `Struct array element type mismatch: expected ${this.type}, got ${value.type}`,
                this.fullPath(ctx),
            );
        }

        this.#codec.write(writer, value.value, ctx);
    }
}

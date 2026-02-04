import { TypeCodec } from '../../TypeCodec';
import { Reader } from '../../Reader';
import { CodecContext } from '../../CodecContext';
import { Writer } from '../../Writer';
import { ArrayValue } from './ArrayValue';
import { BaseCodec } from '../../BaseCodec';
import { CodecError } from '../../Errors/CodecError';

export class ArrayProperty extends BaseCodec implements TypeCodec<ArrayPropertyValue> {
    public readonly type = 'ArrayProperty';

    public read(reader: Reader, length: number, ctx: CodecContext): ArrayPropertyValue {
        if (length < 4) {
            throw new CodecError(
                `ArrayProperty payload is too small (${length}). Expected at least 4 bytes for count.`,
                this.fullPath(ctx),
            );
        }

        const propName = this.propName(ctx);
        const element = ctx.registry.getArray(propName);

        return this.readSized(reader, length, ctx, (payload) => {
            const count = payload.uint32();

            if (count > 0 && payload.position === payload.length) {
                return new ArrayValue(count, new Uint8Array(0));
            }

            // Unknown array: сохраняем сырой payload (после count) как bytes для round-trip.
            if (!element) {
                const rest = payload.bytes(payload.length - payload.position).slice();
                return new ArrayValue(count, rest);
            }

            const items: unknown[] = [];
            for (let i = 0; i < count; i++) {
                items.push(element.read(payload, this.childContext(`[${i}]`, ctx)));
            }

            return items;
        });
    }

    public write(writer: Writer, value: ArrayPropertyValue, ctx: CodecContext): void | number {
        const start = writer.position;

        if (value instanceof ArrayValue) {
            writer.uint32(value.count);
            writer.bytes(value.payload);
            return writer.position - start;
        }

        const propName = this.propName(ctx);
        const element = ctx.registry.getArray(propName);
        if (!element) {
            throw new CodecError(`No element codec for array ${propName}`, this.fullPath(ctx));
        }

        writer.uint32(value.length);

        for (let i = 0; i < value.length; i++) {
            element.write(writer, value[i], this.childContext(`[${i}]`, ctx));
        }

        return writer.position - start;
    }

    public isSupported(value: unknown): value is ArrayPropertyValue {
        return Array.isArray(value) || value instanceof ArrayValue;
    }
}

export type ArrayPropertyValue = Array<unknown> | ArrayValue;

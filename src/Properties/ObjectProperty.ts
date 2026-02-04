import { Reader } from '../Reader';
import { Writer } from '../Writer';
import { Codec } from '../Codec';
import { CodecContext } from '../CodecContext';
import { BaseCodec } from '../BaseCodec';
import { CodecError } from '../Errors/CodecError';

/**
 * Codec for UE object property maps, reading/writing named property lists.
 */
export class ObjectProperty extends BaseCodec implements Codec<ObjectPropertyValue> {
    public read(reader: Reader, length: number, ctx: CodecContext): ObjectPropertyValue {
        const result: ObjectPropertyValue = {};

        let terminated = false;
        while (reader.position < reader.length) {
            const prop = this.readProperty(reader, ctx);
            if (!prop) {
                terminated = true;
                break;
            }
            result[prop[0]] = prop[1];
        }

        if (!terminated) {
            throw new CodecError(`ObjectProperty payload is malformed: Missing terminator None`, this.fullPath(ctx));
        }

        return result;
    }

    public write(writer: Writer, value: ObjectPropertyValue, ctx: CodecContext): void {
        for (const [name, v] of Object.entries(value)) {
            this.writeProperty(writer, name, v, this.childContext(name, ctx));
        }

        writer.string('None').padding();
    }

    private readProperty(reader: Reader, ctx: CodecContext): ObjectPropertyItem | undefined {
        const name = reader.string();
        reader.padding();

        if (name === 'None') return;

        const type = reader.string();
        reader.padding();

        const length = reader.uint32();
        reader.padding();

        const codec = ctx.registry.get(type, name);

        const propertyCtx = this.childContext(name, ctx);
        if (!codec) {
            throw new CodecError(`Cannot find codec ${type}`, this.fullPath(propertyCtx));
        }

        return [name, codec.read(reader, length, propertyCtx)];
    }

    private writeProperty(writer: Writer, name: string, value: unknown, ctx: CodecContext) {
        const codec = ctx.registry.resolveByValue(value);

        if (!codec) {
            const kind =
                value === null
                    ? 'null'
                    : Array.isArray(value)
                      ? 'array'
                      : typeof value === 'object'
                        ? ((value as any).constructor?.name ?? 'object')
                        : typeof value;

            throw new CodecError(`Cannot find codec for value ${kind}`, this.fullPath(ctx));
        }

        writer.string(name).padding();
        writer.string(codec.type).padding();
        writer.withLength(() => codec.write(writer, value, ctx));
    }
}

type ObjectPropertyItem = [name: string, value: unknown];
export type ObjectPropertyValue = Record<string, unknown>;

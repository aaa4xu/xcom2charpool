import { ArrayBufferReader } from '../Core/ArrayBuffer/ArrayBufferReader';
import { Reader } from '../Core/Reader';
import { CharacterPoolUnpacker } from './CharacterPoolUnpacker';
import { CharacterPoolRegistry } from './CharacterPoolRegistry';
import { z, type ZodType } from 'zod/v4';
import { ArrayBufferWriter } from '../Core/ArrayBuffer/ArrayBufferWriter';
import { Writer } from '../Core/Writer';
import { CharacterPoolPacker } from './CharacterPoolPacker';
import { CharacterPoolSchema } from '../Schema/CharacterPoolSchema';
import { TypedArray } from '../Core/Arrays/TypedArray';

export class CharacterPool<TSchema extends ZodType<CharacterPoolFile>> {
    protected readonly schema: TSchema;
    protected readonly registry: CharacterPoolRegistry;

    public static create() {
        return new this({
            schema: CharacterPoolSchema,
            registry: new CharacterPoolRegistry(),
        });
    }

    public constructor(options: { schema: TSchema; registry: CharacterPoolRegistry }) {
        const { schema, registry } = options;
        this.schema = schema;
        this.registry = registry;
    }

    public read(data: ArrayBuffer): z.output<TSchema> {
        const reader = new ArrayBufferReader(new DataView(data));
        const unpacker = this.createPoolUnpacker(reader);
        const file = unpacker.readFile();

        // Validate via schema but preserve original key order for stable re-serialization.
        const parsed = this.schema.safeParse(file);
        if (!parsed.success) {
            throw parsed.error;
        }

        return file as z.output<TSchema>;
    }

    public write(pool: z.output<TSchema>) {
        const writer = new ArrayBufferWriter();
        const packer = this.createPoolPacker(writer);

        packer.writeFile(pool);

        return writer.getBuffer();
    }

    protected createPoolUnpacker(reader: Reader) {
        return new CharacterPoolUnpacker(reader, this.registry);
    }

    protected createPoolPacker(writer: Writer) {
        return new CharacterPoolPacker(writer, this.registry);
    }
}

type CharacterPoolFile = {
    state: Record<string, unknown>;
    data: TypedArray<unknown> | readonly unknown[];
};

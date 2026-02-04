import { ObjectProperty } from '../Properties/ObjectProperty';
import { ArrayProperty } from '../Properties/Array/ArrayProperty';
import { Reader } from '../Reader';
import { Writer } from '../Writer';
import { CodecContext } from '../CodecContext';
import { CodecError } from '../Errors/CodecError';
import { CodecRegistry } from '../Registry';
import { StructArrayElement } from '../Properties/Struct/StructArrayElement';
import { BaseCodec } from '../BaseCodec';
import { CharacterPoolSchema } from '../Schema/CharacterPoolSchema';
import z from 'zod/v4';

/**
 * Core file codec for vanilla CharacterPool binaries with schema validation and registry setup.
 */
export class CharacterPoolFile extends BaseCodec {
    private readonly ctx: CodecContext;
    private readonly obj = new ObjectProperty();
    private readonly arr = new ArrayProperty();
    private readonly magic = 0xffffffff;

    public get registry(): CodecRegistry {
        return this.ctx.registry;
    }

    public constructor() {
        super();

        this.ctx = {
            registry: new CodecRegistry(),
            path: [],
        };

        this.ctx.registry.registerArray('CharacterPool', new StructArrayElement('CharacterPoolDataElement'));
    }

    public read(reader: Reader): z.infer<typeof CharacterPoolSchema> {
        const magic = reader.uint32();
        if (magic !== this.magic) {
            throw new CodecError(`Bad magic: ${magic.toString(16).padStart(8, '0')}`, this.fullPath(this.ctx));
        }

        const Props = this.obj.read(reader, 0, this.childContext('Props', this.ctx));

        const remaining = reader.length - reader.position;
        const CharacterPool = this.arr.read(reader, remaining, this.childContext('CharacterPool', this.ctx));

        if (reader.position !== reader.length) throw new CodecError('Trailing bytes', '<root>');

        const data = { Props, CharacterPool };
        this.schema().parse(data);
        return data as z.infer<typeof CharacterPoolSchema>;
    }

    public write(writer: Writer, file: unknown) {
        const data = this.schema().parse(file);
        writer.uint32(this.magic);
        this.obj.write(writer, data.Props, this.childContext('Props', this.ctx));
        this.arr.write(writer, data.CharacterPool, this.childContext('CharacterPool', this.ctx));
    }

    protected schema() {
        return CharacterPoolSchema;
    }
}

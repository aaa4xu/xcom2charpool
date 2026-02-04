import { ObjectProperty, ObjectPropertyValue } from '../Codecs/ObjectProperty';
import { ArrayProperty, ArrayPropertyValue } from '../Codecs/ArrayProperty';
import { Reader } from '../Reader';
import { Writer } from '../Writer';
import { CodecContext } from '../CodecContext';
import { CodecError } from '../Errors/CodecError';
import { CodecRegistry } from '../Registry';
import { StructArrayElement } from '../Codecs/StructArrayElement';
import { BaseCodec } from '../BaseCodec';

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

    public read(reader: Reader): CharacterPoolFileData {
        const magic = reader.uint32();
        if (magic !== this.magic) {
            throw new CodecError(`Bad magic: ${magic.toString(16).padStart(8, '0')}`, this.fullPath(this.ctx));
        }

        const Props = this.obj.read(reader, 0, this.childContext('Props', this.ctx));

        const remaining = reader.length - reader.position;
        const CharacterPool = this.arr.read(reader, remaining, this.childContext('CharacterPool', this.ctx));

        if (reader.position !== reader.length) throw new CodecError('Trailing bytes', '<root>');
        return { Props, CharacterPool };
    }

    public write(writer: Writer, file: CharacterPoolFileData) {
        writer.uint32(this.magic);
        this.obj.write(writer, file.Props, this.childContext('Props', this.ctx));
        this.arr.write(writer, file.CharacterPool, this.childContext('CharacterPool', this.ctx));
    }
}

export interface CharacterPoolFileData {
    Props: ObjectPropertyValue;
    CharacterPool: ArrayPropertyValue;
}

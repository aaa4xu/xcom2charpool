import { CharacterPoolFile, CharacterPoolFileData } from './CharacterPoolFile';
import { StructArrayElement } from '../Codecs/StructArrayElement';
import { CodecRegistry } from '../Registry';
import { Reader } from '../Reader';
import { Writer } from '../Writer';

export class CharacterPoolFileWithIAM {
    public constructor(private readonly file: CharacterPoolFile) {
        file.registry.registerArray('ExtraDatas', new StructArrayElement('ExtraData'));
        file.registry.registerArray('AppearanceStore', new StructArrayElement('Appearance'));
    }

    public get registry(): CodecRegistry {
        return this.file.registry;
    }

    public read(reader: Reader): CharacterPoolFileData {
        return this.file.read(reader);
    }

    public write(writer: Writer, file: CharacterPoolFileData) {
        this.file.write(writer, file);
    }
}

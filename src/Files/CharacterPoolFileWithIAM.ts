import { CharacterPoolFile } from './CharacterPoolFile';
import { StructArrayElement } from '../Properties/Struct/StructArrayElement';
import { CodecRegistry } from '../Registry';
import { Reader } from '../Reader';
import { Writer } from '../Writer';
import z from 'zod/v4';
import { IAMCharacterPoolSchema } from '../Schema/IAMCharacterPoolSchema';

/**
 * Wrapper that augments CharacterPoolFile with IAM-specific arrays and schema checks.
 */
export class CharacterPoolFileWithIAM {
    public constructor(private readonly file: CharacterPoolFile) {
        file.registry.registerArray('ExtraDatas', new StructArrayElement('ExtraData'));
        file.registry.registerArray('AppearanceStore', new StructArrayElement('Appearance'));
    }

    public get registry(): CodecRegistry {
        return this.file.registry;
    }

    public read(reader: Reader) {
        const data = this.file.read(reader);
        IAMCharacterPoolSchema.parse(data);
        return data as z.infer<typeof IAMCharacterPoolSchema>;
    }

    public write(writer: Writer, file: unknown) {
        IAMCharacterPoolSchema.parse(file);
        this.file.write(writer, file);
    }
}

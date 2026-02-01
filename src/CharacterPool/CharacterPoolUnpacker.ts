import type { Reader } from '../Core/Reader';
import { ArrayProperty } from '../Core/Properties/ArrayProperty';
import { Unpacker as BaseUnpacker } from '../Core/Unpacker';
import { CharacterPoolRegistry } from './CharacterPoolRegistry';

/**
 * File-level unpacker for XCOM 2 character pool binaries.
 * Reads the magic, property state, and trailing CharacterPoolDataElements array.
 */
export class CharacterPoolUnpacker extends BaseUnpacker {
    public constructor(reader: Reader, registry = new CharacterPoolRegistry()) {
        super(reader, registry);
    }

    public readFile() {
        const magic = this.reader.uint32();

        if (magic !== 0xffffffff) {
            throw new Error(`Incorrect file magic 0x${magic.toString(16).padStart(8, '0')}`);
        }

        const state = this.properties();

        // Почему-то внизу файла присобачен еще один массив
        const trailingArrayName = 'CharacterPoolDataElements';
        const arr = ArrayProperty.from(this.reader, trailingArrayName, this.reader.length - this.reader.position);

        const arrayFactory = this.registry.array(trailingArrayName);
        if (!arrayFactory) throw new Error(`Unknown array ${trailingArrayName}`);

        const data = arrayFactory.from(arr, '', (reader: Reader) => new CharacterPoolUnpacker(reader, this.registry));

        if (this.reader.position < this.reader.length) {
            throw new Error(
                `Reader is not in the end of file! ${this.reader.length - this.reader.position} bytes remains`,
            );
        }

        return { state, data };
    }
}

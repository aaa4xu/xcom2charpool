import type { Reader } from '../Core/Reader';
import { ArrayOfStructs } from './ArrayOfStructs';
import { ArrayProperty } from '../Core/Properties/ArrayProperty';

export class CharacterPoolDataElements extends ArrayOfStructs {
    public constructor(array: ArrayProperty, factory: (reader: Reader) => unknown) {
        super(array, 'CharacterPoolDataElement', factory);
    }
}

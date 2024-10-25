import type { Reader } from '../Reader';
import { ArrayOfStructs } from './ArrayOfStructs';
import { ArrayProperty } from '../Properties/ArrayProperty';

export class CharacterPoolDataElements extends ArrayOfStructs {
    public constructor(array: ArrayProperty, factory: (reader: Reader) => unknown) {
        super(array, 'CharacterPoolDataElement', factory);
    }
}

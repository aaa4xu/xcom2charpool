import type { Reader } from '../Core/Reader';
import { ArrayProperty } from '../Core/Properties/ArrayProperty';
import { IntProperty } from '../Core/Properties/IntProperty';

export class ArrayOfInt {
    public static from(array: ArrayProperty, elementsType: string, factory: (reader: Reader) => any) {
        return Array.from({ length: array.length }, () => IntProperty.from(array.reader, elementsType, 0));
    }
}

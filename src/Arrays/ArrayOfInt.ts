import type { Reader } from '../Reader';
import { ArrayProperty } from '../Properties/ArrayProperty';
import { IntProperty } from '../Properties/IntProperty';

export class ArrayOfInt {
  public static from(array: ArrayProperty, elementsType: string, factory: (reader: Reader) => any) {
    return Array.from({ length: array.length }, () => IntProperty.from(array.reader, elementsType, 0));
  }
}

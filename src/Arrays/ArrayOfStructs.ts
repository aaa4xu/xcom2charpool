import type { Reader } from '../Reader';
import { ArrayProperty } from '../Properties/ArrayProperty';
import { StructProperty } from '../Properties/StructProperty';

export class ArrayOfStructs {
  public readonly items: ReadonlyArray<StructProperty>;

  public static from(array: ArrayProperty, elementsType: string, factory: (reader: Reader) => any) {
    return new this(array, elementsType, factory);
  }

  public constructor(array: ArrayProperty, elementsType: string, factory: (reader: Reader) => any) {
    this.items = Array.from({ length: array.length }, () =>
      StructProperty.from(array.reader, elementsType, 0, factory),
    );
  }
}

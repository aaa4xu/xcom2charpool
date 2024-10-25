import type { Reader } from '../Reader';
import type { Writer } from '../Writer';
import { Packer } from '../Packer';

export class ArrayProperty {
  public constructor(public readonly length: number, public readonly reader: Reader) {}

  public static from(reader: Reader, name: string, size: number) {
    const length = reader.int32();
    return new this(length, reader.subarray(size - 4));
  }

  public static to<T>(target: Writer, value: readonly T[], packer: Packer) {
    // Write the length of the array
    target.int32(value.length);

    // If the array is empty, nothing more to write
    if (value.length === 0) {
      return;
    }

    for (let i = 0; i < value.length; i++) {
      packer.writeProperty('', value[i], true);
    }
  }
}

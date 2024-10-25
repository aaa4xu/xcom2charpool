import type { Reader } from './Reader';
import type { Writer } from './Writer';
import { Unpacker } from './Unpacker';
import { Packer } from './Packer';

export interface PropertyFactory<T> {
  name: string;
  from(reader: Reader, name: string, size: number, factory: (reader: Reader) => Unpacker): T;
  to(target: Writer, value: any, packer: Packer, isArrayElement?: boolean): number | void;
}

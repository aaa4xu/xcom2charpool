import type { Reader } from './Reader';
import type { Writer } from './Writer';
import type { Packer } from './Packer';
import type { Unpacker } from './Unpacker';

export interface PropertyFactory<T> {
    readonly type: string;
    from(reader: Reader, name: string, size: number, factory: (reader: Reader) => Unpacker): T;
    to(target: Writer, value: any, packer: Packer, isArrayElement?: boolean): number | void;
}

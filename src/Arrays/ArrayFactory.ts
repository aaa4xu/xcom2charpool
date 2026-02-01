import type { Reader } from '../Core/Reader';
import { ArrayProperty } from '../Core/Properties/ArrayProperty';

export interface ArrayFactory<T> {
    from(array: ArrayProperty, elementsType: string, factory: (reader: Reader) => any): T;
}

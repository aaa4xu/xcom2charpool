import type { Reader } from '../Reader';
import { ArrayProperty } from '../Properties/ArrayProperty';

export interface ArrayFactory<T> {
    from(array: ArrayProperty, elementsType: string, factory: (reader: Reader) => any): T;
}

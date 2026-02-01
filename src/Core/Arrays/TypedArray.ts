import type { Reader } from '../Reader';
import { ArrayProperty } from '../Properties/ArrayProperty';
import type { ArrayFactory } from './ArrayFactory';
import { PropertyFactory } from '../PropertyFactory';

export class TypedArray<T> {
    public constructor(public readonly items: ReadonlyArray<T>) {}

    public static of<T>(type: PropertyFactory<T>): ArrayFactory<TypedArray<T>> {
        return {
            from(array: ArrayProperty, elementsType: string, factory: (reader: Reader) => any) {
                const items = Array.from({ length: array.length }, () =>
                    type.from(array.reader, elementsType, 0, factory),
                );

                return new TypedArray(items);
            },
        };
    }
}

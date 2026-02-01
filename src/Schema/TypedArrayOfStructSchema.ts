import { z, type ZodType } from 'zod/v4';
import { TypedArray } from '../Core/Arrays/TypedArray';
import { StructPropertySchema, type StructOf } from './StructPropertySchema';

export const TypedArrayOfStructSchema = <T extends ZodType>(typeName: string, valueSchema: T) => {
    const structSchema = StructPropertySchema(typeName, valueSchema);

    return (z.instanceof(TypedArray) as unknown as z.ZodType<TypedArray<StructOf<T>>>).check(
        z.property('items', z.array(structSchema)),
    );
};

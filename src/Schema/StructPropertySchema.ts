import { z, type ZodType } from 'zod/v4';
import { StructProperty } from '../Core/Properties/StructProperty';

export type StructOf<T extends ZodType> = StructProperty & { value: z.output<T> };

export const StructPropertySchema = <T extends ZodType>(typeName: string, valueSchema: T) => {
    const structChecks = [z.property('value', valueSchema)] as const;

    return (z.instanceof(StructProperty) as unknown as z.ZodType<StructOf<T>>).check(
        ...(typeName ? [...structChecks, z.property('type', z.literal(typeName))] : structChecks),
    );
};

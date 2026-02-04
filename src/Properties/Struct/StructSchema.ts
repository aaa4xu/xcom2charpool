import z from 'zod/v4';
import { StructPropertyValue } from './StructPropertyValue';

export type StructOf<T extends z.ZodType> = StructPropertyValue & { value: z.output<T> };

export const StructSchema = <T extends z.ZodType>(type: string, valueSchema: T) => {
    const structChecks = [z.property('value', valueSchema)] as const;

    return (z.instanceof(StructPropertyValue) as unknown as z.ZodType<StructOf<T>>).check(
        ...(type ? [...structChecks, z.property('type', z.literal(type))] : structChecks),
    );
};

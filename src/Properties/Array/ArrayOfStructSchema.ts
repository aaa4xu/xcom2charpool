import z from 'zod/v4';
import { StructSchema } from '../Struct/StructSchema';

export const ArrayOfStructSchema = <T extends z.ZodType>(type: string, valueSchema: T) => {
    return z.array(StructSchema(type, valueSchema));
};

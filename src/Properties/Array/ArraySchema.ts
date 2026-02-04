import z from 'zod/v4';
import { ArrayValue } from './ArrayValue';

export const ArraySchema = z
    .instanceof(ArrayValue)
    .check(z.property('count', z.int().min(0)), z.property('payload', z.instanceof(Uint8Array)));

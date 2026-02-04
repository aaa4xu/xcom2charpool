import z from 'zod/v4';
import { BytePropertyValue } from './BytePropertyValue';

export const ByteSchema = z
    .instanceof(BytePropertyValue)
    .check(z.property('value', z.string()), z.property('type', z.string()));

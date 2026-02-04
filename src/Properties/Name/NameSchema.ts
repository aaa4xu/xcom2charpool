import z from 'zod/v4';
import { NamePropertyValue } from './NamePropertyValue';

export const NameSchema = z
    .instanceof(NamePropertyValue)
    .check(z.property('value', z.string()), z.property('instanceId', z.int().min(0)));

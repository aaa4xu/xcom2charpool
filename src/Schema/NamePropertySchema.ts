import { z } from 'zod/v4';
import { NameProperty } from '../Core/Properties/NameProperty';

export const NamePropertySchema = z.instanceof(NameProperty).check(
    z.property('value', z.string()),
    z.property('instanceId', z.int().min(0)),
);

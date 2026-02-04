import z from 'zod/v4';
import { ArrayOfStructSchema } from '../Properties/Array/ArrayOfStructSchema';
import { CharacterPoolDataItemSchema } from './CharacterPoolDataItemSchema';

export const CharacterPoolSchema = z.looseObject({
    Props: z.record(z.string(), z.unknown()),
    CharacterPool: ArrayOfStructSchema('CharacterPoolDataElement', CharacterPoolDataItemSchema),
});

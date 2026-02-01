import { z } from 'zod/v4';
import { TypedArrayOfStructSchema } from './TypedArrayOfStructSchema';
import { CharacterPoolDataItemSchema } from './CharacterPoolDataItemSchema';
import { StructPropertySchema } from './StructPropertySchema';

export const CharacterPoolSchema = z.looseObject({
    data: TypedArrayOfStructSchema('', CharacterPoolDataItemSchema),
    state: z.looseObject({
        CharacterPool: TypedArrayOfStructSchema('CharacterPool', z.unknown()),
        CharacterPoolSerializeHelper: StructPropertySchema('CharacterPoolDataElement', z.unknown()),
        GenderHelper: z.int().optional(),
    }),
});

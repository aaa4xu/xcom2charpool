import z from 'zod/v4';
import { CharacterPoolSchema } from './CharacterPoolSchema';
import { ArrayOfStructSchema } from '../Properties/Array/ArrayOfStructSchema';
import { CharacterPoolDataItemSchema } from './CharacterPoolDataItemSchema';
import { TAppearanceSchema } from './TAppearanceSchema';
import { StructSchema } from '../Properties/Struct/StructSchema';

export const IAMCharacterPoolSchema = CharacterPoolSchema.extend({
    Props: z.looseObject({
        ExtraDatas: ArrayOfStructSchema(
            'ExtraData',
            z.looseObject({
                CharPoolData: StructSchema('CharacterPoolDataElement', CharacterPoolDataItemSchema),
                AppearanceStore: ArrayOfStructSchema('Appearance', TAppearanceSchema.partial()),
            }),
        ).optional(),
    }),
});

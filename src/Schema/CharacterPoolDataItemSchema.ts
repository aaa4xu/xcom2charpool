import { z } from 'zod/v4';
import { NamePropertySchema } from './NamePropertySchema';
import { TypedArrayOfStructSchema } from './TypedArrayOfStructSchema';
import { TAppearanceSchema } from './TAppearanceSchema';
import { StructPropertySchema } from './StructPropertySchema';

export const CharacterPoolDataItemSchema = z.looseObject({
    strFirstName: z.string(),
    strLastName: z.string(),
    strNickName: z.string(),
    m_SoldierClassTemplateName: NamePropertySchema,
    CharacterTemplateName: NamePropertySchema,
    kAppearance: StructPropertySchema('TAppearance', TAppearanceSchema),
    Country: NamePropertySchema,
    AllowedTypeSoldier: z.boolean(),
    AllowedTypeVIP: z.boolean(),
    AllowedTypeDarkVIP: z.boolean(),
    PoolTimestamp: z.string(),
    BackgroundText: z.string(),
});

import z from 'zod/v4';
import { TAppearanceSchema } from './TAppearanceSchema';
import { NameSchema } from '../Properties/Name/NameSchema';
import { StructSchema } from '../Properties/Struct/StructSchema';

export const CharacterPoolDataItemSchema = z.looseObject({
    strFirstName: z.string(),
    strLastName: z.string(),
    strNickName: z.string().optional(),
    m_SoldierClassTemplateName: NameSchema,
    CharacterTemplateName: NameSchema,
    kAppearance: StructSchema('TAppearance', TAppearanceSchema.partial()),
    Country: NameSchema,
    AllowedTypeSoldier: z.boolean().optional(),
    AllowedTypeVIP: z.boolean().optional(),
    AllowedTypeDarkVIP: z.boolean().optional(),
    PoolTimestamp: z.string(),
    BackgroundText: z.string(),
});

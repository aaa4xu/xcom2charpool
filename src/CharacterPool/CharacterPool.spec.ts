import { CharacterPool } from './CharacterPool';
import { CharacterPoolRegistry } from './CharacterPoolRegistry';
import { TypedArray } from '../Core/Arrays/TypedArray';
import { z } from 'zod/v4';

describe('CharacterPool.read', () => {
    test('accepts Buffer slices with byte offsets', () => {
        const charpool = new CharacterPool({
            schema: z.any() as unknown as z.ZodType<any>,
            registry: new CharacterPoolRegistry(),
        });
        const original = charpool.write({ state: {}, data: [] });
        const source = Buffer.alloc(original.byteLength + 8);
        const offset = 4;

        Buffer.from(original).copy(source, offset);
        const slice = source.subarray(offset, offset + original.byteLength);

        const parsed = charpool.read(slice);

        expect(parsed.state).toStrictEqual({});
        expect(parsed.data).toBeInstanceOf(TypedArray);
        expect((parsed.data as TypedArray<unknown>).items).toStrictEqual([]);
    });
});

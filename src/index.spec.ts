import { statSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { CharacterPool } from './CharacterPool/CharacterPool';

describe('xcom2charpool', () => {
    const poolPath = path.join(__dirname, '../storage/odd-s9.bin');
    let poolExists = false;
    try {
        statSync(poolPath);
        poolExists = true;
    } catch {}

    itif(poolExists)('should recreate charpool', async () => {
        const charpool = CharacterPool.create();

        const original = await fs.readFile(poolPath);
        const pool = charpool.read(original.buffer);
        const serialized = charpool.write(pool);

        expect(md5(Buffer.from(serialized))).toEqual(md5(original));
    });
});

function itif(condition: boolean) {
    return condition ? test : test.skip;
}

const md5 = (buf: Buffer) => crypto.createHash('md5').update(buf).digest('hex');
